{
	type Trait = {
		readonly [key: string]: (...args: any[]) => any;
	};
	type Struct = {
		readonly [key: string]: string | bigint | boolean | number | ReadonlyArray<Struct> | Struct;
	};

	function impl<T extends Trait, S extends Struct>(
		impl: { [K in keyof T]: (self: S, ...args: Parameters<T[K]>) => ReturnType<T[K]> },
	) {
		return impl;
	}

	type Timestamp = {
		createdAt: number;
	};

	type Circle = {
		radius: number;
		timestamp: Timestamp;
	};

	type Square = {
		size: number;
	};

	type Drawable = {
		draw(delay: number): void;
	};

	const CircleDrawer = impl<Drawable, Circle>({
		draw(self: Circle, delay: number) {
			console.log(`Drawing a circle with radius ${self.radius} after ${delay}ms`);
		},
	});

	const SquareDrawer = impl<Drawable, Square>({
		draw(self: Square, delay: number) {
			console.log(`Drawing a square with size ${self.size} after ${delay}ms`);
		},
	});

	const circle: Circle = { radius: 5, timestamp: { createdAt: Date.now() } };
	CircleDrawer.draw(circle, 1000);

	const square: Square = { size: 10 };
	SquareDrawer.draw(square, 500);
}

{
	class Timestamp {
		constructor(public createdAt: number) {}
	}

	class Circle implements Drawable {
		constructor(public radius: number, public timestamp: Timestamp) {}
		draw(delay: number) {
			console.log(`Drawing a circle with radius ${this.radius} after ${delay}ms`);
		}
	}

	class Square implements Drawable {
		constructor(public size: number) {}
		draw(delay: number) {
			console.log(`Drawing a square with size ${this.size} after ${delay}ms`);
		}
	}

	interface Drawable {
		draw(delay: number): void;
	}
}

{
	type Timestamp = {
		createdAt: number;
	};

	type Circle = {
		radius: number;
		timestamp: Timestamp;
	};

	const Circle: Drawable<Circle> = {
		draw(self: Circle, delay: number) {
			console.log(`Drawing a circle with radius ${self.radius} after ${delay}ms`);
		},
	};

	type Square = {
		size: number;
	};

	const Square: Drawable<Square> & Resizeable<Square> = {
		draw(self: Square, delay: number) {
			console.log(`Drawing a square with size ${self.size} after ${delay}ms`);
		},
		resize(self: Square, factor: number) {
			self.size *= factor;
		},
	};

	type Drawable<S> = {
		draw(self: S, delay: number): void;
	};

	type Resizeable<S> = {
		resize(self: S, factor: number): void;
	};

	const circle: Circle = { radius: 5, timestamp: { createdAt: Date.now() } };
	Circle.draw(circle, 1000);

	const square: Square = { size: 10 };
	Square.draw(square, 500);
	Square.resize(square, 2);
	Square.draw(square, 500);
}

{
	type Timestamp = {
		createdAt: number;
	};

	type Circle = {
		radius: number;
		timestamp: Timestamp;
	};

	type Square = {
		size: number;
	};

	type CircleDrawer = Drawable<Circle>;
	const CircleDrawer: CircleDrawer = {
		draw(self: Circle, delay: number) {
			console.log(`Drawing a circle with radius ${self.radius} after ${delay}ms`);
		},
	};

	type SquareDrawer = Drawable<Square>;
	const SquareDrawer: SquareDrawer = {
		draw(self: Square, delay: number) {
			console.log(`Drawing a square with size ${self.size} after ${delay}ms`);
		},
	};

	type SquareResizer = Resizeable<Square>;
	const SquareResizer: SquareResizer = {
		resize(self: Square, factor: number) {
			self.size *= factor;
		},
	};

	type Drawable<S> = {
		draw(self: S, delay: number): void;
	};

	type Resizeable<S> = {
		resize(self: S, factor: number): void;
	};

	const circle: Circle = { radius: 5, timestamp: { createdAt: Date.now() } };
	CircleDrawer.draw(circle, 1000);

	const square: Square = { size: 10 };
	SquareDrawer.draw(square, 500);
	SquareResizer.resize(square, 2);
	SquareDrawer.draw(square, 500);
}

{
	type Timestamp = {
		createdAt: number;
	};

	type Circle = {
		radius: number;
		timestamp: Timestamp;
	};

	type Drawable<S> = {
		draw(self: S, delay: number): void;
	};
	// default impl
	const Drawable = {
		draw<S>(self: S, delay: number) {
			// This is just a placeholder. In a real implementation, you'd have logic to determine how to draw based on the type of S.
			console.log(`Drawing after ${delay}ms`);
		},
	};

	const Circle: Drawable<Circle> = {
		draw(self: Circle, delay: number) {
			return Drawable.draw(self, delay); // Call default impl if needed
		},
	};

	type Square = {
		size: number;
	};

	const Square: Drawable<Square> & Resizeable<Square> = {
		draw(self: Square, delay: number) {
			console.log(`Drawing a square with size ${self.size} after ${delay}ms`);
		},
		resize(self: Square, factor: number) {
			self.size *= factor;
		},
	};

	type Resizeable<S> = {
		resize(self: S, factor: number): void;
	};

	const circle: Circle = { radius: 5, timestamp: { createdAt: Date.now() } };
	Circle.draw(circle, 1000);

	const square: Square = { size: 10 };
	Square.draw(square, 500);
	Square.resize(square, 2);
	Square.draw(square, 500);
}
