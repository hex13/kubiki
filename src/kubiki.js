export function init(params) {
	return new Kubiki(params);
}


const vertexShaderSource = `
attribute vec2 aPosition;
void main() {
	gl_Position = vec4(aPosition, 0.0, 1.0);
}
`;

const fragmentShaderSource = `
void main() {
	gl_FragColor = vec4(0.1, 0.0, 1.0, 1.0);
}
`;

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

		const aPosition = gl.getAttribLocation(this.program, 'aPosition');
		const buffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
			0.0, 0.0,
			1.0, 0.0,
			1.0, 1.0,
		]), gl.STATIC_DRAW);
		gl.enableVertexAttribArray(aPosition);
		gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);
		gl.useProgram(this.program)
		gl.drawArrays(gl.TRIANGLES, 0, 3);
		return this;
	}
}