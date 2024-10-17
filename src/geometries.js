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
	constructor(start, Y) {
		this.cursor = start;
		this.vertices = [];
		this.dir = [1, 0, 0];
		this.Y = Y;
	}
	forward(amount = 1) {
		const delta = [this.dir[0] * amount, this.dir[1] * amount, this.dir[2] * amount];
		this.vertices.push(...buildRectVertices(this.cursor, delta, this.Y));
		this.cursor[0] += this.dir[0] * amount;
		this.cursor[1] += this.dir[1] * amount;
		this.cursor[2] += this.dir[2] * amount;
		return this;
	}
	left() {
		const prevX = this.dir[0];
		this.dir[0] = this.dir[2];
		this.dir[2] = -prevX;
		return this;
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

const wallBuilder = new FaceBuilder([offsetX, offsetY, offsetZ], Y);

wallBuilder
	.forward()
	.left()
	.forward()
	.left()
	.forward()
	.left()
	.forward()

function buildTopBottom([x, y, z]) {
	return [
		...buildRectVertices([x, y + 1, z], [1, 0, 0], [0, 0, -1]),
		...buildRectVertices([x, y, z - 1], [1, 0, 0], [0, 0, 1]),
	];
}

export const boxGeometry = {
	vertices: new Float32Array([
		...wallBuilder.vertices,
		...buildTopBottom([offsetX, offsetY, offsetZ], [1, 0, 0], [0, 0, -1]),
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
