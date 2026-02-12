# Rust-Flavored TypeScript: Structs, Traits, and Impls Without Classes

## The Problem With Classes in TypeScript

Classes in TypeScript bundle data and behavior together. You define a shape, attach methods to it, use `this`
everywhere, and before long you're deep in inheritance chains, decorator patterns, and wondering why your "simple data
object" has fifteen methods on its prototype.

```typescript
class Square {
	constructor(public size: number) {}
	draw(delay: number) {
		console.log(`Drawing ${this.size} after ${delay}ms`);
	}
	resize(factor: number) {
		this.size *= factor;
	}
}
```

This works, but it's opaque. The data isn't separable from the behavior. You can't serialize a `Square` without
stripping methods. You can't compose behaviors without reaching for mixins or multiple inheritance hacks. And `this` is
a footgun that never stops firing.

What if we took the Rust approach instead — but adapted it for idiomatic TypeScript?

## The Core Idea

Rust separates three concerns cleanly:

- **Structs** — plain data, no methods
- **Traits** — interfaces that define behavior
- **Impls** — blocks that attach behavior to structs, optionally implementing traits

We can express all three in TypeScript using only `type` and `const`, zero classes, and a couple of utility types that
fit in six lines.

## Structs: Just Data

A struct is a plain type alias. No methods. No `this`. Just the shape of the data.

```typescript
export type Circle = { radius: number };
export type Square = { size: number };
export type Point = { x: number; y: number };
```

When composing structs, use nesting instead of intersection types. This keeps things readable, debuggable, and
structurally honest — a `Square` _has_ a position, it doesn't _become_ one.

```typescript
// ✅ Nested composition
export type Square = {
	size: number;
	position: Point;
};

// ❌ Intersection (flattens unrelated concerns)
export type Square = Point & {
	size: number;
};
```

Structs are always serializable. You can `JSON.stringify` them, store them, send them over the wire. They're just data.

## Traits: Contracts for Behavior

A trait is a generic type where every method takes `self: S` as the first parameter. The generic `S` is the struct the
trait operates on.

```typescript
export type Drawable<S> = {
	draw(self: S, delay: number): void;
};

export type Resizeable<S> = {
	resize(self: S, factor: number): void;
};
```

This is the key insight: **traits don't know which struct they'll be attached to**. They define a contract — "anything
that implements `Drawable` must have a `draw` method that takes the thing itself and a delay."

### Default Impls

Just like Rust, a trait can provide default method implementations. Give the trait a companion `const` with the same
name:

```typescript
export const Drawable = {
	draw<S>(self: S, delay: number) {
		console.log(`Drawing after ${delay}ms`);
	},
};
```

Structs that implement `Drawable` can delegate to this default or provide their own.

## The Glue: Two Utility Types

The entire system is held together by two small types:

```typescript
export type Trait<S> = {
	[key: string]: (self: S, ...args: any) => any;
};

export type Impl<S, Traits extends Trait<S> = {}> = {
	[key: string]:
		| ((...args: any) => Promise<S> | S)
		| ((self: S, ...args: any) => any);
} & Traits;
```

**`Trait<S>`** constrains that every method in a trait object takes `self: S` first.

**`Impl<S, Traits?>`** says: "this object contains methods that either:

- take `self: S` and do something (trait methods), or
- return `S` (inherent methods like constructors/factories)

...and it also satisfies the given `Traits`."

That's it. No generics gymnastics, no mapped conditional inference nightmares. Just an index signature and an
intersection.

## Impls: Where Behavior Lives

An impl is a `const` object that shares the same name as the struct type (TypeScript lets types and values occupy the
same name). You use `satisfies` to enforce the constraint while preserving inferred method signatures.

### Inherent Methods Only

```typescript
export const Point = {
	create(x: number, y: number): Point {
		return { x, y };
	},
} satisfies Impl<Point>;
```

`create` returns `Point`, so `Impl<Point>` accepts it. No traits involved — these are just methods that belong to
`Point` itself.

### Implementing Traits

```typescript
export const Circle = {
	create(radius: number): Circle {
		return { radius };
	},
	draw(self, delay) {
		return Drawable.draw(self, delay); // delegates to default
	},
} satisfies Impl<Circle, Drawable<Circle>>;
```

The second type parameter to `Impl` is the trait (or intersection of traits) being implemented. `satisfies` checks that
`draw` matches `Drawable<Circle>`'s signature — and **contextually types `self` and `delay`** so you don't have to
annotate them.

### Multiple Traits

Compose traits with `&`:

```typescript
export const Square = {
	create(size: number): Square {
		return { size };
	},
	draw(self, delay) {
		console.log(`Drawing a square with size ${self.size} after ${delay}ms`);
	},
	resize(self, factor) {
		self.size *= factor;
	},
} satisfies Impl<Square, Drawable<Square> & Resizeable<Square>>;
```

`self` is inferred as `Square` in every method. `delay` is `number`. `factor` is `number`. Zero annotations on the trait
methods — `satisfies` handles it.

### Using It

```typescript
const square = Square.create(10);
Square.draw(square, 500);
Square.resize(square, 2);
Square.draw(square, 500);
```

This reads almost like Rust. The struct and its impl share a name, so `Square.create(10)` feels natural. Methods take
the instance explicitly — no hidden `this` binding.

## Why `satisfies` Instead of a Type Annotation?

This is a subtle but critical decision.

You might try:

```typescript
export const Circle: Impl<Circle, Drawable<Circle>> = { ... };
```

This _works_ for trait methods — `draw(self, delay)` gets contextual types. But it **kills inference on inherent
methods**. The annotation locks the object's visible shape to the `Impl` index signature, so `Circle.create` becomes
`(...args: any) => Circle | Promise<Circle>` instead of keeping its nice `(radius: number) => Circle` signature.

With `satisfies`:

```typescript
export const Circle = { ... } satisfies Impl<Circle, Drawable<Circle>>;
```

TypeScript **checks** that the object matches the constraint, but **preserves the inferred type** of the whole object.
So `Circle.create` stays `(radius: number) => Circle`, and trait methods still get `self: Circle` from the contextual
type. Best of both worlds.

## The Rules, Summarized

1. **Structs** are `type` aliases — pure data, no methods, nested composition over intersections
2. **Traits** are generic types with `self: S` first parameter on every method
3. **Impls** are `const` objects using `satisfies Impl<S, Traits?>` — never class instances
4. Inherent methods (like `create`) must have explicit return type annotations
5. Trait methods get their types from `satisfies` — don't annotate them
6. Methods can only return structs (plain data) — never return objects with methods
7. Use `&` to compose multiple traits in a single impl

## Compared to Rust

| Rust                                             | This Pattern                                                      |
| ------------------------------------------------ | ----------------------------------------------------------------- |
| `struct Circle { radius: f64 }`                  | `type Circle = { radius: number }`                                |
| `trait Drawable { fn draw(&self, delay: u32); }` | `type Drawable<S> = { draw(self: S, delay: number): void }`       |
| `impl Drawable for Circle { ... }`               | `const Circle = { ... } satisfies Impl<Circle, Drawable<Circle>>` |
| `impl Circle { fn new(r: f64) -> Self { ... } }` | Same const — just add `create(r: number): Circle`                 |
| `Circle::new(5.0)`                               | `Circle.create(5.0)`                                              |
| `circle.draw(500)`                               | `Circle.draw(circle, 500)`                                        |

The main difference is that Rust has method dispatch syntax (`circle.draw()`), while we pass `self` explicitly
(`Circle.draw(circle, ...)`). That's the tradeoff — but it also means there's zero hidden state, zero `this` confusion,
and everything is a plain function call on a plain object.

## When This Shines

- **Serialization** — structs are always JSON-safe
- **Testing** — create test data with object literals, no constructor ceremony
- **Composition** — traits compose with `&`, no diamond inheritance
- **Refactoring** — behavior is in one place (the impl), data is in another (the struct)
- **Tree-shaking** — unused impl methods are just unused object properties

It's not Rust. But it's the closest you can get in TypeScript without fighting the language — and it's a lot more
pleasant than the class-based alternative.
