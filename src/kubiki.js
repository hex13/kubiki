import { SceneObject } from './SceneObject.js';
import { triangleGeometry, boxGeometry } from './geometries.js';
import { vertexShaderSource, fragmentShaderSource } from './shaders.js';

import { mat4 } from 'gl-matrix';

export function init(params) {
	return new Kubiki(params);
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
		this.canvas = canvas;

		const gl = canvas.getContext('webgl');
		const { program } = initWebGL(gl);
		this.program = program;
		this.gl = gl;
		this.params = params;
		this.projection = mat4.create();
		const viewMatrix = mat4.create();
		mat4.translate(viewMatrix, viewMatrix, [0, 0, -10]);
		mat4.perspective(this.projection, 80, params.width/params.height, 0.001, 100);
		mat4.mul(this.projection, this.projection, viewMatrix);


		this.objects = [];
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
	render() {
		const { gl, params } = this;
		gl.clearColor(...params.background);
		gl.clear(this.gl.COLOR_BUFFER_BIT);

		this.objects.forEach(obj => {
			const dimensions = 2;
			const aPosition = gl.getAttribLocation(this.program, 'aPosition');
			const uPosition = gl.getUniformLocation(this.program, 'uPosition');
			const uTransform = gl.getUniformLocation(this.program, 'uTransform');
			const uProjection = gl.getUniformLocation(this.program, 'uProjection');
			gl.useProgram(this.program);
			const transform = mat4.create();
			mat4.scale(transform, transform, obj.transform.scale);
			mat4.translate(transform, transform, obj.transform.position);

			gl.uniformMatrix4fv(uTransform, false, transform);
			gl.uniformMatrix4fv(uProjection, false, this.projection);
			const buffer = gl.createBuffer();
			gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
			gl.bufferData(gl.ARRAY_BUFFER, obj.geometry, gl.STATIC_DRAW);
			gl.enableVertexAttribArray(aPosition);
			gl.vertexAttribPointer(aPosition, dimensions, gl.FLOAT, false, 0, 0);
			gl.drawArrays(gl.TRIANGLES, 0, obj.geometry.length / dimensions);
		});
		return this;
	}
}