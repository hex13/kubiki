import { mat4 } from 'gl-matrix';

export class SceneObject {
	transform = {
		position: [0, 0, 0, 1],
		scale: [1, 1, 1],
		rotation: [0, 0, 0],
		target: null,
		matrix: mat4.create(),
	};
	constructor(geometry) {
		this.geometry = geometry;
	}
	setTransformItem(name, ...args) {
		const v = this.transform[name];
		for (let i = 0; i < args.length; i++) {
			v[i] = typeof args[i] == 'function'? args[i](v[i]) : args[i];
		}
		return this;
	}
	position(x, y, z) {
		return this.setTransformItem('position', x, y, z);
	}
	rotation(x, y, z) {
		return this.setTransformItem('rotation', x, y, z);
	}
	scale(x, y, z) {
		return this.setTransformItem('scale', x, y, z);
	}
	lookAt(x, y, z) {
		this.transform.target = [x, y, z];
		return this;
	}
	computeMatrix() {
		const matrix = this.transform.matrix;
		mat4.identity(matrix);
		mat4.scale(matrix, matrix, this.transform.scale);
		mat4.translate(matrix, matrix, this.transform.position);
		if (this.transform.target) {
			const up = [0, 1, 0];
			mat4.targetTo(matrix, this.transform.position.slice(0, 3), this.transform.target, up);
		} else {
			mat4.rotateX(matrix, matrix, this.transform.rotation[0]);
			mat4.rotateY(matrix, matrix, this.transform.rotation[1]);
			mat4.rotateZ(matrix, matrix, this.transform.rotation[2]);
		}
	}
}
