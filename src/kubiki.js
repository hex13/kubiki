import { SceneObject } from './SceneObject.js';
import { triangleGeometry, rectGeometry, boxGeometry } from './geometries.js';
import { createTerrain } from 'tileterrain';
import { vec3 } from 'gl-matrix';
import { WebGLRenderer } from './renderer.js';
import { ThreeRenderer } from './ThreeRenderer.js';
import { DomRenderer } from './DomRenderer.js';
import { Scheduler } from 'taska';
import { Reconciler } from './Reconciler';


import { mat4 } from 'gl-matrix';

export function terrain(params) {
	const sceneObject = new SceneObject(rectGeometry);
	const terrain = createTerrain({
		rows: params.rows,
		columns: params.columns,
		tileSize: 1,
		onChange({ position }) {
			const normals = new Float32Array(position.length);

			for (let i = 0; i < normals.length; i += 9) {
				const a = vec3.create();
				a[0] = position[i + 0];
				a[1] = position[i + 1];
				a[2] = position[i + 2];
				const b = vec3.create();
				b[0] = position[i + 3 + 0];
				b[1] = position[i + 3 + 1];
				b[2] = position[i + 3 + 2];
				const c = vec3.create();
				c[0] = position[i + 6 + 0];
				c[1] = position[i + 6 + 1];
				c[2] = position[i + 6 + 2];

				a[0] = b[0] - a[0];
				a[1] = b[1] - a[1];
				a[2] = b[2] - a[2];

				b[0] = c[0] - b[0];
				b[1] = c[1] - b[1];
				b[2] = c[2] - b[2];
				const product = vec3.cross(a, a, b);

				for (let j = 0; j < 3; j++) {
					normals[i + j * 3] = product[0];
					normals[i + j * 3 + 1] = product[1];
					normals[i + j * 3 + 2] = product[2];

				}

			}
			sceneObject.geometry = {normals, vertices: position};
		}
	});
	terrain.raise({x: 7, y: 5}, 1);
	terrain.raise({x: 4, y: 3}, 1);

	return sceneObject;
}

export function init(params) {
	return new Kubiki(params);
}

export function rect() {
	return new SceneObject(rectGeometry);
}

export function box() {
	return new SceneObject(boxGeometry);
}

export function instanced() {
	const obj = new SceneObject(boxGeometry);
	obj.instanced = true;
	return obj;
}
export function room(params) {
	const obj = instanced();
	const room = obj.room = params;

	const instances = [];
	const instanceCount = obj.room.walls.reduce((count, wall) => {
		return count + wall.doors.length + 1;
	}, 0);

	let idx = 0;
	let x = 0;
	let y = 0;
	let isVertical = false;
	let rotation = 0;
	const nextPos = (length) => {
		const dx = Math.cos(rotation) * length;
		const dy = Math.sin(rotation) * length;
		x += dx;
		y += dy;
	}
	const nextWall = (length) => {
		const dx = Math.cos(rotation) * length;
		const dy = Math.sin(rotation) * length;
		instances[idx] = {
			position: [x + dx / 2, y + dy / 2, 0],
			rotation: [0, 0, rotation],
			scale: [length, room.wallThickness, 1],
		};
		nextPos(length);
		idx++;
	};

	for (let i = 0; i < 4; i++) {
		const wall = room.walls[i];
		let length = i % 2 == 0? room.width : room.height - 2 * room.wallThickness;
		if (wall.doors.length) {
			let lastPos = 0;
			for (let doorIdx = 0; doorIdx < wall.doors.length; doorIdx++) {
				nextWall(wall.doors[doorIdx] - lastPos);
				nextPos(room.doorLength);
				lastPos = wall.doors[doorIdx] + room.doorLength;
			}
			if (lastPos < length) {
				nextWall(length - lastPos);
			}
		} else {
			nextWall(length);
		}

		if (i % 2 == 0) {
			nextPos(-room.wallThickness / 2);
			rotation += Math.PI / 2;
			nextPos(room.wallThickness / 2);
		} else {
			nextPos(room.wallThickness / 2);
			rotation += Math.PI / 2;
			nextPos(-room.wallThickness / 2);
		}
	}

	obj.instances = instances;
	return obj;
}

export function triangle() {
	return new SceneObject(triangleGeometry);
}

export function something2D() {
	return new SceneObject(null, '2D');
}

export function label(text) {
	const label = new SceneObject(null, '2D');
	label.type = 'label';
	label.text = text;
	return label;
}


class Kubiki {
	loaders = [];
	objects = [];
	renderers = [];
	constructor(params) {
		params = structuredClone(params);
		params.background = params.background || [0, 0, 0, 1];
		params.camera = params.camera || {
			fov: Math.PI / 3,
		};

		this.params = params;

		const canvas = document.createElement('canvas');
		canvas.width = params.width;
		canvas.height = params.height;

		this.canvas = canvas;
		const gl = canvas.getContext('webgl2');
		this.camera = new SceneObject().position(0, 0, 20);
		this.camera.computeMatrix();


		this.renderers.push(new ThreeRenderer(gl, params, this));
		this.renderers.push( new WebGLRenderer(gl, params, this));
		this.renderers.push(new DomRenderer(gl, params, this));


		['click','pointerdown', 'pointerup', 'pointermove'].forEach(type => {
			this.renderers.forEach(renderer => renderer.enableEvent(type));
		});

		this.scheduler = new Scheduler();
	}
	add(obj) {
		obj.kubiki = this;
		this.objects.push(obj);
		this.renderers.forEach(renderer => renderer.add(obj));
		return this;
	}
	remove(obj) {
		const idx = this.objects.indexOf(obj);
		if (idx >= 0) {
			this.objects.splice(idx, 1);
		}
		this.renderers.forEach(renderer => renderer.remove(obj));

	}
	addLoader(loader) {
		this.loaders.push(loader);
	}
	load(params) {
		for (let i = 0; i < this.loaders.length; i++) {
			const obj = this.loaders[i](params);
			if (obj) return obj;
		}
		return new SceneObject(boxGeometry);
	}
	mount(domEl) {
		domEl.append(this.canvas);
		return this;
	}
	render(t) {
		this.scheduler.update(t);
		this.camera.computeMatrix();
		this.renderers.forEach(renderer => renderer.render());
		return this;
	}
	dynamic(handlers) {
		const state = {};
		const reconciler = new Reconciler(handlers, this.add.bind(this), this.remove.bind(this));
		return {
			state,
			update: f => {
				f(state);
				reconciler.update(state);
			}
		}
	}
}