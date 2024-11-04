import { vertexShaderSource, fragmentShaderSource } from './shaders.js';
import { mat4 } from 'gl-matrix';

// abstract class for renderers
export class Renderer {
	camera = null;
	enableEvent() {

	}
	render() {

	}
	add() {

	}
}

function compileShader(gl, type, source) {
	const shader = gl.createShader(type);
	gl.shaderSource(shader, source);
	gl.compileShader(shader);
	return shader;
}

export function createTexture(gl, width, height) {
	const texture = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, texture);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	return texture;
}

export class WebGLRenderer extends Renderer {
	constructor(gl, params) {
		super();
		this.gl = gl;
		this.params = params;

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
		this.program = program;

		gl.enable(gl.DEPTH_TEST);
		gl.enable(gl.CULL_FACE);

		this.projection = mat4.create();
		this.viewMatrix = mat4.create();
		mat4.perspective(this.projection, Math.PI / 3, params.width / params.height, 0.001, 100);
		this.init();
	}
	init() {
		const { gl } = this;
		const pickingTexture = createTexture(gl, gl.canvas.width, gl.canvas.height);
		this.pickingFramebuffer = gl.createFramebuffer();
		gl.bindFramebuffer(gl.FRAMEBUFFER, this.pickingFramebuffer);
		gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, pickingTexture, 0);
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
	}
	clear(...clearColor) {
		const { gl } = this;
		gl.clearColor(...clearColor);
		gl.clear(this.gl.COLOR_BUFFER_BIT);
		gl.clear(this.gl.DEPTH_BUFFER_BIT);
	}
	renderObjects(objects, picking = false) {
		const { gl } = this;
		objects.forEach((obj, i) => {
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
			gl.drawArrays(gl.TRIANGLES, 0, obj.geometry.vertices.length / dimensions);
		});
	}
	render() {
		mat4.invert(this.viewMatrix, this.camera.transform.matrix);

		const { gl } = this;
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		this.clear(...this.params.background);
		this.renderObjects(this.objects, false);

		gl.bindFramebuffer(gl.FRAMEBUFFER, this.pickingFramebuffer);
		this.clear(0, 0, 0, 0);
		this.renderObjects(this.objects, true);
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
	}
	enableEvent(eventType) {
		const { gl } = this;
		const { canvas } = gl;
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
}
