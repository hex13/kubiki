import { SceneObject } from './SceneObject.js';
import { triangleGeometry, rectGeometry, boxGeometry } from './geometries.js';
import { createTerrain } from 'tileterrain';
import { vec3 } from 'gl-matrix';
import { initWebGL, createTexture } from './renderer.js';

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

class Kubiki {
	enableEvent(eventType) {
		const { canvas, gl } = this;
		const pixels = new Uint8Array(4);
		canvas.addEventListener(eventType, e => {
			const bounds = e.target.getBoundingClientRect();
			const x = e.clientX - bounds.x;
			const y = canvas.height - (e.clientY - bounds.y);

			gl.bindFramebuffer(gl.FRAMEBUFFER, this.pickingFramebuffer);
			gl.readPixels(x, y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
			const objIndex = pixels[0] - 1;
			if (objIndex >= 0) {
				const obj = this.objects[objIndex];
				if (obj) {
					obj.emit(e.type, e);
				}
			}
		});
	}
	constructor(params) {
		params = structuredClone(params);
		params.background = params.background || [0, 0, 0, 1];
		const canvas = document.createElement('canvas');
		canvas.width = params.width;
		canvas.height = params.height;

		this.canvas = canvas;
		const gl = canvas.getContext('webgl');

		const { program, renderer, pickingFramebuffer } = initWebGL(gl);
		this.program = program;
		this.renderer = renderer;
		this.pickingFramebuffer = pickingFramebuffer;
		this.gl = gl;

		this.params = params;
		this.projection = mat4.create();

		this.camera = new SceneObject().position(0, 0, 20);
		this.viewMatrix = mat4.create();
		this.#computeCamera();
		mat4.perspective(this.projection, Math.PI / 3, params.width / params.height, 0.001, 100);

		this.objects = [];

		this.enableEvent('click');
		this.enableEvent('pointerdown');
		this.enableEvent('pointerup');
		this.enableEvent('pointermove');

	}
	#computeCamera() {
		this.camera.computeMatrix();
		mat4.invert(this.viewMatrix, this.camera.transform.matrix);
	}
	add(obj) {
		this.objects.push(obj);
		return this;
	}
	mount(domEl) {
		console.log("mounted", domEl, this.canvas)
		domEl.append(this.canvas);
		return this;
	}
	renderObjects(objects, picking = false) {
		const { gl } = this;
		this.objects.forEach((obj, i) => {
			const dimensions = 3;
			const aPosition = gl.getAttribLocation(this.program, 'aPosition');
			const aNormal = gl.getAttribLocation(this.program, 'aNormal');
			const uPosition = gl.getUniformLocation(this.program, 'uPosition');
			const uTransform = gl.getUniformLocation(this.program, 'uTransform');
			const uProjection = gl.getUniformLocation(this.program, 'uProjection');
			const uObjectIndex = gl.getUniformLocation(this.program, 'uObjectIndex');
			const uView = gl.getUniformLocation(this.program, 'uView');
			const uColor = gl.getUniformLocation(this.program, 'uColor');
			gl.useProgram(this.program);
			gl.uniform1i(uObjectIndex, picking? i + 1 : 0);
			gl.uniform3fv(uColor, obj.material.color);
			obj.computeMatrix();
			const transform = obj.transform.matrix;
			gl.uniformMatrix4fv(uTransform, false, transform);
			gl.uniformMatrix4fv(uProjection, false, this.projection);
			gl.uniformMatrix4fv(uView, false, this.viewMatrix);

			const buffer = gl.createBuffer();
			gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
			gl.bufferData(gl.ARRAY_BUFFER, obj.geometry.vertices, gl.STATIC_DRAW);
			gl.enableVertexAttribArray(aPosition);
			gl.vertexAttribPointer(aPosition, dimensions, gl.FLOAT, false, 0, 0);

			if (obj.geometry.normals) {
				const buffer = gl.createBuffer();
				gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
				gl.bufferData(gl.ARRAY_BUFFER, obj.geometry.normals, gl.STATIC_DRAW);
				gl.enableVertexAttribArray(aNormal);
				gl.vertexAttribPointer(aNormal, dimensions, gl.FLOAT, false, 0, 0);
			}
			// console.warn("##")
			gl.drawArrays(gl.TRIANGLES, 0, obj.geometry.vertices.length / dimensions);
			// console.warn("--", obj.geometry)
		});
	}
	render(t) {
		this.#computeCamera();
		const { gl, params } = this;

		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		this.renderer.clear(...params.background);
		this.renderObjects(this.objects, false);

		gl.bindFramebuffer(gl.FRAMEBUFFER, this.pickingFramebuffer);
		this.renderer.clear(0, 0, 0, 0);
		this.renderObjects(this.objects, true);
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		return this;
	}
}