export const triangleGeometry = new Float32Array([
	0.0, 0.0, 0.0,
	1.0, 0.0, 0.0,
	1.0, 1.0, 0.0,
]);

function buildRectGeometry(start, X, Y) {
	const a = start;
	const b = [start[0] + X[0], start[1] + X[1], start[2] + X[2]];
	const c = [b[0] + Y[0], b[1] + Y[1], b[2] + Y[2]];
	const d = [start[0] + Y[0], start[1] + Y[1], start[2] + Y[2]];
	return [
		...a,
		...b,
		...c,
		...a,
		...c,
		...d,
	];
}

export const rectGeometry = new Float32Array([
	0.0, 0.0, 0.0,
	1.0, 0.0, 0.0,
	1.0, 1.0, 0.0,
	0.0, 0.0, 0.0,
	1.0, 1.0, 0.0,
	0.0, 1.0, 0.0,
]);

let X = [1, 0, 0];
let Y = [0, 1, 0];

const box = [
	...buildRectGeometry([0, 0, 0], [1, 0, 0], Y),
	...buildRectGeometry([1, 0, 0], [0, 0, -1], Y),
	...buildRectGeometry([1, 0, -1], [-1, 0, 0], Y),
	...buildRectGeometry([0, 0, -1], [0, 0, 1], Y),
	...buildRectGeometry([0, 1, 0], [1, 0, 0], [0, 0, -1]),
	...buildRectGeometry([0, 0, -1], [1, 0, 0], [0, 0, 1]),
]
export const boxGeometry = new Float32Array(box);
