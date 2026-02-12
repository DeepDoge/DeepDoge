# Rust-Flavored TypeScript: Structs, Traits, and Impls Without Classes

## Core Utilities (copy/paste)

```typescript
export type Trait<Self = any> = {
    [key: string]: (self: Self, ...args: any) => any;
};

export type Impl<Self = any, Traits extends Trait<Self> = {}> = {
    [key: string]:
        | ((...args: any) => Promise<Self> | Self)
        | ((self: Self, ...args: any) => any);
} & Traits;

export type ExtractTrait<T, Self> = {
    [K in keyof T as T[K] extends (self: Self, ...args: any) => any ? K : never]: T[K];
};

export type Dyn<T extends Trait> = {
    [K in keyof T]: T[K] extends (self: any, ...args: infer A) => infer R ? (...args: A) => R : T[K];
};

export function dyn<T extends Impl<Self>, Self>(
    impl: T,
    instance: Self,
): Dyn<ExtractTrait<T, Self>> {
    return new Proxy(impl, {
        get(target, prop, receiver) {
            const value = Reflect.get(target, prop, receiver);
            if (typeof value === "function") return (...args: any[]) => value(instance, ...args);
            return value;
        },
    }) as never;
}
```

## Structs

Structs are plain data types (no methods).

```typescript
export type Circle = { radius: number };
export type Square = { size: number };
export type Point = { x: number; y: number };
```

Struct composition uses nesting (not intersection).

```typescript
// ✅ Nested composition
export type Square = {
    size: number;
    position: Point;
};

// ❌ Intersection
export type Square = Point & {
    size: number;
};
```

## Traits

Traits are generic types. Every method takes `self: Self` as the first parameter. `Self` defaults to `any`.

```typescript
export type Drawable<Self = any> = {
    draw(self: Self, delay: number): void;
};

export type Resizeable<Self = any> = {
    resize(self: Self, factor: number): void;
};
```

### Supertraits

A trait can require another trait via intersection.

```typescript
export type Fancy<Self = any> = Drawable<Self> & {
    sparkle(self: Self): void;
};
```

### Default Impls

A trait can have a companion const with generic default implementations.

```typescript
export const Drawable = {
    draw<Self>(self: Self, delay: number) {
        console.log(`Drawing after ${delay}ms`);
    },
};
```

## Impls

Impls are `const` objects (same name as the struct type). Always use `satisfies` on the object literal.

- `satisfies Impl<Self>`: inherent methods only
- `satisfies Impl<Self, Traits>`: inherent + trait methods

Rules for method typing:
- Inherent methods (e.g. `create`) **must** have an explicit return type.
- Trait methods **must not** annotate args/return; they get contextual types from `satisfies`.

```typescript
export const Point = {
    create(x: number, y: number): Point {
        return { x, y };
    },
} satisfies Impl<Point>;

export const Circle = {
    create(radius: number): Circle {
        return { radius };
    },
    draw(self, delay) {
        return Drawable.draw(self, delay);
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
```

Usage:

```typescript
const square = Square.create(10);
Square.draw(square, 500);
Square.resize(square, 2);
Square.draw(square, 500);
```

## dyn() and Dyn

`dyn(impl, instance)` binds `self` so calls don’t require passing the instance. `Self` is inferred from `instance`.

```typescript
const square = Square.create(10);

const d = dyn(Square, square);
d.draw(500);
d.resize(2);
```

`Dyn<Trait>` is the bound-call surface (same methods, but with `self` removed).

```typescript
function animate(shape: Dyn<Drawable>) {
    shape.draw(100);
}

animate(dyn(Square, square));
animate(dyn(Circle, Circle.create(5)));
```

## Rules

1. Structs are `type` aliases: pure data, no methods
2. Struct composition uses nesting (no intersection types for “embedding”)
3. Traits are generic types: `type X<Self = any> = { method(self: Self, ...): ... }`
4. Impls are `const` objects: `const X = { ... } satisfies Impl<X, Traits?>`
5. Inherent methods: explicit return type annotation required
6. Trait methods: no arg/return annotations; types come from `satisfies`
7. Methods return plain data (structs) only
8. Compose traits with `&`
9. Use `dyn(impl, instance)` to bind `self`; use `Dyn<Trait>` to type bound objects
