import { mat4 } from 'gl-matrix';

export class SceneObject {
	transform = {
		position: [0, 0, 0, 1],
		scale: [1, 1, 1],
		rotation: [0, 0, 0],
		matrix: mat4.create(),
	};
	constructor(geometry) {
		this.geometry = geometry;
	}
	position(x, y, z) {
		const { position } = this.transform;
		position[0] = typeof x == 'function'? x(position[0]) : x;
		position[1] = typeof y == 'function'? y(position[1]) : y;
		position[2] = typeof z == 'function'? z(position[2]) : z;
		return this;
	}
	computeMatrix() {
		const matrix = this.transform.matrix;
	    mat4.identity(matrix);
		mat4.scale(matrix, matrix, this.transform.scale);
		mat4.translate(matrix, matrix, this.transform.position);
		mat4.rotateX(matrix, matrix, this.transform.rotation[0]);
		mat4.rotateY(matrix, matrix, this.transform.rotation[1]);
		mat4.rotateZ(matrix, matrix, this.transform.rotation[2]);
	}
}
