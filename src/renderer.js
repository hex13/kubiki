import { vertexShaderSource, fragmentShaderSource } from './shaders.js';

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

class WebGLRenderer {
	constructor(gl) {
		this.gl = gl;
	}
	clear(...clearColor) {
		const { gl } = this;
		gl.clearColor(...clearColor);
		gl.clear(this.gl.COLOR_BUFFER_BIT);
		gl.clear(this.gl.DEPTH_BUFFER_BIT);
	}
	render() {

	}
}

export function initWebGL(gl) {
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

	gl.enable(gl.DEPTH_TEST);
	gl.enable(gl.CULL_FACE);

	const pickingTexture = createTexture(gl, gl.canvas.width, gl.canvas.height);
	const pickingFramebuffer = gl.createFramebuffer();
	gl.bindFramebuffer(gl.FRAMEBUFFER, pickingFramebuffer);
	gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, pickingTexture, 0);
	gl.bindFramebuffer(gl.FRAMEBUFFER, null);

	const renderer = new WebGLRenderer(gl);
	return { program, renderer, pickingFramebuffer };
}

