import { mat4 } from 'gl-matrix';
import { mix, mixObjects } from 'taska/src/utils';

export class SceneObject {
	kubiki = null;
	transform = {
		position: [0, 0, 0, 1],
		scale: [1, 1, 1],
		rotation: [0, 0, 0],
		target: null,
		matrix: mat4.create(),
		material: {
			color: [1.0, 1.0, 1.0],
		},
	};
	listeners = Object.create(null);
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
	color(r, g, b) {
		const { color } = this.transform.material;
		color[0] = r;
		color[1] = g;
		color[2] = b;
		return this;
	}
	on(eventType, f) {
		this.listeners[eventType] = this.listeners[eventType] || [];
		this.listeners[eventType].push(f);
		return this;
	}
	emit(eventType, e) {
		const handlers = this.listeners[eventType];
		if (handlers) handlers.forEach(h => h(e));
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
	animate(to, duration) {
		const from = structuredClone(this.transform);
		return this.kubiki.scheduler.schedule({
			duration,
			update: (t, a) => {
				console.log("AAAA", mixObjects(from, to, a))
				this.transform = mixObjects(from, to, a);
			}
		});
	}
}
