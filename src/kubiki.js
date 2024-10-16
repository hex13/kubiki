import { SceneObject } from './SceneObject.js';
import { triangleGeometry, rectGeometry, boxGeometry } from './geometries.js';
import { vertexShaderSource, fragmentShaderSource } from './shaders.js';

import { mat4 } from 'gl-matrix';

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

function compileShader(gl, type, source) {
	const shader = gl.createShader(type);
	gl.shaderSource(shader, source);
	gl.compileShader(shader);
	return shader;
}

function createTexture(gl, width, height) {
	const texture = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, texture);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	return texture;
}

function initWebGL(gl) {
	let status;
	const vertexShader = compileShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
	status = gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS);
	console.log("vertexShader", status, gl.getShaderInfoLog(vertexShader))
	const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
	status = gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS);
	console.log("fragmentShader", status, gl.getShaderInfoLog(fragmentShader))

	const program = gl.createProgram();
	gl.attachShader(program, vertexShader);
	gl.attachShader(program, fragmentShader);
	gl.linkProgram(program);
	return { program };
}

class Kubiki {
	constructor(params) {
		params = structuredClone(params);
		params.background = params.background || [0, 0, 0, 1];
		const canvas = document.createElement('canvas');
		canvas.width = params.width;
		canvas.height = params.height;

		const pixels = new Uint8Array(4);


		canvas.addEventListener('click', e => {
			const bounds = e.target.getBoundingClientRect();
			const x = e.clientX - bounds.x;
			const y = canvas.height - (e.clientY - bounds.y);
			gl.bindFramebuffer(gl.FRAMEBUFFER, this.pickingFramebuffer);
			gl.readPixels(x, y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
			const objIndex = pixels[0] - 1;
			if (objIndex >= 0) {
				console.log("objIndex", objIndex);
				const obj = this.objects[objIndex];
				obj.position(x => x, y => y + 1, z => z);
				console.log("P", this.objects[objIndex]);
			}

		});
		this.canvas = canvas;

		const gl = canvas.getContext('webgl');
		gl.enable(gl.DEPTH_TEST);
		gl.enable(gl.CULL_FACE);
		const { program } = initWebGL(gl);
		this.program = program;
		this.gl = gl;

		const pickingTexture = createTexture(gl, canvas.width, canvas.height);
		this.pickingFramebuffer = gl.createFramebuffer();
		gl.bindFramebuffer(gl.FRAMEBUFFER, this.pickingFramebuffer);
		gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, pickingTexture, 0);
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);

		this.params = params;
		this.projection = mat4.create();

		this.camera = new SceneObject().position(0, 0, 10);
		this.viewMatrix = mat4.create();
		this.#computeCamera();
		mat4.perspective(this.projection, Math.PI / 3, params.width / params.height, 0.001, 100);

		this.objects = [];
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
			gl.useProgram(this.program);
			gl.uniform1i(uObjectIndex, picking? i + 1 : 0);
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

			gl.drawArrays(gl.TRIANGLES, 0, obj.geometry.vertices.length / dimensions);
		});
	}
	render(t) {
		this.#computeCamera();
		const { gl, params } = this;
		gl.clearColor(...params.background);
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		gl.clear(this.gl.COLOR_BUFFER_BIT);
		gl.clear(this.gl.DEPTH_BUFFER_BIT);
		this.renderObjects(this.objects, false);
		gl.bindFramebuffer(gl.FRAMEBUFFER, this.pickingFramebuffer);
		gl.clear(this.gl.COLOR_BUFFER_BIT);
		gl.clear(this.gl.DEPTH_BUFFER_BIT);
		this.renderObjects(this.objects, true);
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		return this;
	}
}