export const triangleGeometry = {
	vertices: new Float32Array([
		0.0, 0.0, 0.0,
		1.0, 0.0, 0.0,
		1.0, 1.0, 0.0,
	]),
}

function buildRectVertices(start, X, Y) {
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

export const rectGeometry = {
	vertices: new Float32Array([
		0.0, 0.0, 0.0,
		1.0, 0.0, 0.0,
		1.0, 1.0, 0.0,
		0.0, 0.0, 0.0,
		1.0, 1.0, 0.0,
		0.0, 1.0, 0.0,
	])
};

let X = [1, 0, 0];
let Y = [0, 1, 0];

const frontNormal = [0, 0, 1];
const backNormal = [0, 0, -1];
const leftNormal = [-1, 0, 0];
const rightNormal = [1, 0, 0];
const topNormal = [0, 1, 0];
const bottomNormal = [0, -1, 0];

export const boxGeometry = {
	vertices: new Float32Array([
		...buildRectVertices([0, 0, 0], [1, 0, 0], Y),
		...buildRectVertices([1, 0, 0], [0, 0, -1], Y),
		...buildRectVertices([1, 0, -1], [-1, 0, 0], Y),
		...buildRectVertices([0, 0, -1], [0, 0, 1], Y),
		...buildRectVertices([0, 1, 0], [1, 0, 0], [0, 0, -1]),
		...buildRectVertices([0, 0, -1], [1, 0, 0], [0, 0, 1]),
	]),
	normals: new Float32Array([
		...frontNormal,
		...frontNormal,
		...frontNormal,
		...frontNormal,
		...frontNormal,
		...frontNormal,

		...rightNormal,
		...rightNormal,
		...rightNormal,
		...rightNormal,
		...rightNormal,
		...rightNormal,

		...backNormal,
		...backNormal,
		...backNormal,
		...backNormal,
		...backNormal,
		...backNormal,

		...leftNormal,
		...leftNormal,
		...leftNormal,
		...leftNormal,
		...leftNormal,
		...leftNormal,

		...topNormal,
		...topNormal,
		...topNormal,
		...topNormal,
		...topNormal,
		...topNormal,

		...bottomNormal,
		...bottomNormal,
		...bottomNormal,
		...bottomNormal,
		...bottomNormal,
		...bottomNormal,
	]),
};
