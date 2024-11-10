import { SceneObject } from './SceneObject.js';
import { triangleGeometry, rectGeometry, boxGeometry } from './geometries.js';
import { createTerrain } from 'tileterrain';
import { vec3 } from 'gl-matrix';
import { WebGLRenderer } from './renderer.js';
import { ThreeRenderer } from './ThreeRenderer.js';
import { DomRenderer } from './DomRenderer.js';
import { Scheduler } from 'taska';

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

export function triangle() {
	return new SceneObject(triangleGeometry);
}

export function something2D() {
	return new SceneObject(null, '2D');
}

class Kubiki {
	loaders = [];
	objects = [];
	renderers = [];
	constructor(params) {
		params = structuredClone(params);
		params.background = params.background || [0, 0, 0, 1];
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
}