import { mat4, vec3 } from 'gl-matrix';
import { mix, mixObjects } from 'taska/src/utils.js';

export class SceneObject {
	kubiki = null;
	type = '';
	regions = [];
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
	children = [];
	listeners = Object.create(null);
	constructor(geometry, coordsKind = '3D') {
		this.geometry = geometry;
		this.coords = coordsKind;
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
		if (this.parent && this.parent.transform.matrix) {
			mat4.mul(matrix, matrix, this.parent.transform.matrix);
		}
		mat4.translate(matrix, matrix, this.transform.position);

		if (this.transform.target) {
			const up = [0, 1, 0];
			mat4.targetTo(matrix, this.transform.position.slice(0, 3), this.transform.target, up);
		} else {
			mat4.rotateX(matrix, matrix, this.transform.rotation[0]);
			mat4.rotateY(matrix, matrix, this.transform.rotation[1]);
			mat4.rotateZ(matrix, matrix, this.transform.rotation[2]);
		}
		mat4.scale(matrix, matrix, this.transform.scale);
	}
	animate(to, duration) {
		const from = structuredClone(this.transform);
		return this.kubiki.scheduler.schedule({
			duration,
			update: (t, a) => {
				this.transform = mixObjects(from, to, a);
			}
		});
	}
	add(child) {
		this.children.push(child);
		child.parent = this;
		this.kubiki?.onAdd(child, this);
	}
	remove() {
		this.kubiki.remove(this);
	}
	findRegion([x, y, z]) {
		return this.regions.find(({ position, size })=> {
			return (
				x >= position[0] && x < position[0] + size[0] &&
				y >= position[1] && y < position[1] + size[1] &&
				z >= position[2] && z < position[2] + size[2]
			);
		}) || null;
	}
	localToWorld(v) {
		this.computeMatrix();
		return vec3.transformMat4(vec3.create(), v, this.transform.matrix)
	}
	worldToLocal(v) {
		this.computeMatrix();
		const inverted = mat4.invert(mat4.create(), this.transform.matrix);
		return vec3.transformMat4(vec3.create(), v, inverted);
	}
}
