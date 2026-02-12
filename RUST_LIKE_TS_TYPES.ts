## Design Principles

- **Composition over inheritance** — no classes
- **Separation of data and behavior** — types are pure data, behavior lives in separate objects or factory functions
- Mutability is fine — don't fight JS/TS, use `readonly` only when it genuinely makes sense

## Structs, Traits, and Impls

Inspired by Rust's data model, adapted for idiomatic TypeScript.

- **Structs** — type definitions with no methods, pure data only
- **Traits** — type definitions with at least one `S` generic parameter, containing methods only (first param is
  `self: S`)
- **Impls** — const objects with the same name as the struct, typed as `Impl<S, Traits>` to combine:
  - inherent methods (e.g. `create()`)
  - trait methods (e.g. `draw(self, ...)`)

Methods can only return structs (plain data). Never return anything with methods.

### Structs

Structs use nested composition instead of intersection types. Embed other structs as fields rather than merging with
`&`.

```typescript
// ✅ Good — nested composition
export type Square = {
	size: number;
	position: Point;
};

// ❌ Bad — intersection
export type Square = Point & {
	size: number;
};
```

### Traits

Traits are generic types parameterized by the struct they operate on. Every method takes `self` as the first parameter.

Traits can have a default impl — a const object with the same name providing generic default methods.

```typescript
export type Drawable<S> = {
	draw(self: S, delay: number): void;
};

// Default impl
export const Drawable = {
	draw<S>(self: S, delay: number) {
		console.log(`Drawing after ${delay}ms`);
	},
};

export type Resizeable<S> = {
	resize(self: S, factor: number): void;
};
```

### Impls

The const object shares the same name as the struct type.

- Use `Impl<S, Traits>` when you want both inherent + trait methods.
- Use `Impl<S>` when you only want inherent methods.

To use a default impl, delegate to the trait's default const.

```typescript
export type Circle = { radius: number };
export type Square = { size: number };
export type Point = { x: number; y: number };

export const Circle = {
	create(radius: number): Circle {
		return { radius };
	},
	draw(self, delay) {
		return Drawable.draw(self, delay); // uses default
	},
} satisfies Impl<Circle, Drawable<Circle>>;

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

// Or impl without trait — inherent methods only
export const Point = {
	create(x: number, y: number): Point {
		return { x, y };
	},
} satisfies Impl<Point>;

// Usage
const square = Square.create(10);
Square.draw(square, 500);
Square.resize(square, 2);
Square.draw(square, 500);
```

### ❌ Bad — Classes with methods

```typescript
export class Square {
	constructor(public size: number) {}
	draw(delay: number) {
		console.log(`Drawing a square with size ${this.size} after ${delay}ms`);
	}
	resize(factor: number) {
		this.size *= factor;
	}
}
```
