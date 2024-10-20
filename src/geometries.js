import { vec3 } from 'gl-matrix';

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
	constructor(start, X, Y) {
		this.cursor = start;
		this.vertices = [];
		this.normals = [];
		this.dir = X;
		this.Y = Y;
	}
	forward(amount = 1) {
		const delta = [this.dir[0] * amount, this.dir[1] * amount, this.dir[2] * amount];
		const normal = vec3.create();
		vec3.cross(normal, this.dir, this.Y);

		const vertices = buildRectVertices(this.cursor, delta, this.Y);
		for (let i = 0; i < vertices.length / 3; i++) {
			this.normals.push(...normal);
		}
		this.vertices.push(...vertices);
		this.cursor[0] += this.dir[0] * amount;
		this.cursor[1] += this.dir[1] * amount;
		this.cursor[2] += this.dir[2] * amount;
		return this;
	}
	turn90(axis, dir) {
		let axisA, axisB;
		if (axis == 'y') {
			axisA = 0;
			axisB = 2;
		}
		const prevA = this.dir[axisA];
		this.dir[axisA] = -this.dir[axisB] * dir;
		this.dir[axisB] = prevA * dir;
		return this;
	}
	left() {
		return this.turn90('y', -1);
	}
	right() {
		return this.turn90('y', 1);
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

const wallBuilder = new FaceBuilder([offsetX, offsetY, offsetZ], [1, 0, 0], Y);

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

const topBuilder = new FaceBuilder([offsetX, offsetY + 1, offsetZ], [1, 0, 0], [0, 0, -1]);
const bottomBuilder = new FaceBuilder([offsetX, offsetY, offsetZ - 1], [1, 0, 0], [0, 0, 1]);
topBuilder.forward(1);
bottomBuilder.forward(1);
export const boxGeometry = {
	vertices: new Float32Array([
		...wallBuilder.vertices,
		...topBuilder.vertices,
		...bottomBuilder.vertices,
		// ...buildTopBottom([offsetX, offsetY, offsetZ], [1, 0, 0], [0, 0, -1]),
	]),
	normals: new Float32Array([
		...wallBuilder.normals,
		...topBuilder.normals,
		...bottomBuilder.normals,
	]),
};

