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
		this.plane = {
			xAxis: [1, 0, 0],
			yAxis: [0, 1, 0],
			zAxis: [0, 0, 1],
			reversed: false,
		};
		this.isHidden = false;
	}
	hidden() {
		this.isHidden = true;
		return this;
	}
	visible() {
		this.isHidden = false;
		return this;
	}
	skip(amount = 1) {
		return this.hidden().forward(amount).visible();
	}
	wrap() {
		const { xAxis, zAxis, reversed } = this.plane;
		this.plane.xAxis = [-zAxis[0], -zAxis[1], -zAxis[2]];
		this.plane.zAxis = xAxis;
		return this;
	}
	log() {
		console.log("cursor", ...this.cursor, 'plane', {...this.plane});
		return this;
	}
	forward(amount = 1) {
		const { xAxis, yAxis, reversed } = this.plane;
		const delta = [xAxis[0] * amount, xAxis[1] * amount, xAxis[2] * amount];
		const normal = vec3.create();
		if (reversed) {
			vec3.cross(normal, yAxis, xAxis);
		} else {
			vec3.cross(normal, xAxis, yAxis);
		}

		if (!this.isHidden) {
			const vertices = buildRectVertices(this.cursor, reversed? yAxis: delta, reversed? delta : yAxis);
			for (let i = 0; i < vertices.length / 3; i++) {
				this.normals.push(...normal);
			}
			this.vertices.push(...vertices);

		}
		this.cursor[0] += xAxis[0] * amount;
		this.cursor[1] += xAxis[1] * amount;
		this.cursor[2] += xAxis[2] * amount;
		return this;
	}
	turn() {
		const { xAxis, yAxis, reversed } = this.plane;
		this.plane.xAxis = yAxis;
		this.plane.yAxis = xAxis;
		this.plane.reversed = !reversed;
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

const wallBuilder = new FaceBuilder([offsetX, offsetY, offsetZ], [1, 0, 0], Y);

const w = 5;
const h = 3;

wallBuilder
	.forward(1)
	.wrap().forward(1)
	.wrap().forward(1)
	.wrap().forward(1)
	.wrap()
	.turn()
	.skip()
	.wrap()
	.forward() // top
	.wrap()
	.skip()
	.wrap()
	.forward() // bottom


export const boxGeometry = {
	vertices: new Float32Array([
		...wallBuilder.vertices,
	]),
	normals: new Float32Array([
		...wallBuilder.normals,
	]),
};