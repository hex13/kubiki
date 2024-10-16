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

class FaceBuilder {
	constructor(start) {
		this.cursor = start;
	}
	build(X, Y) {
		const result = buildRectVertices(this.cursor, X, Y);
		this.cursor[0] += X[0];
		this.cursor[1] += X[1];
		this.cursor[2] += X[2];
		return result;
	}
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

const offsetX = -0.5;
const offsetY = -0.5;
const offsetZ = 0.5;

const wallBuilder = new FaceBuilder([offsetX, offsetY, offsetZ]);

export const boxGeometry = {
	vertices: new Float32Array([
		...wallBuilder.build([1, 0, 0], Y),
		...wallBuilder.build([0, 0, -1], Y),
		...wallBuilder.build([-1, 0, 0], Y),
		...wallBuilder.build([0, 0, 1], Y),
		...buildRectVertices([offsetX, offsetY + 1, offsetZ], [1, 0, 0], [0, 0, -1]),
		...buildRectVertices([offsetX, offsetY, offsetZ - 1], [1, 0, 0], [0, 0, 1]),
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
