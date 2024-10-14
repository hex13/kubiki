export function init(params) {
	return new Kubiki(params);
}


const vertexShaderSource = `
attribute vec2 aPosition;
uniform vec2 uPosition;
#define SCALE 0.5
void main() {
	gl_Position = vec4((aPosition + uPosition) * SCALE, 0.0, 1.0);
}
`;

const fragmentShaderSource = `
void main() {
	gl_FragColor = vec4(1.0, 0.0, 1.0, 1.0);
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

const triangleGeometry = new Float32Array([
	0.0, 0.0,
	1.0, 0.0,
	1.0, 1.0,
]);

const boxGeometry = new Float32Array([
	0.0, 0.0,
	1.0, 0.0,
	1.0, 1.0,
	0.0, 0.0,
	1.0, 1.0,
	0.0, 1.0,
]);


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
		this.objects = [
			{position: [0, 0], geometry: boxGeometry},
			{position: [0, -1.3], geometry: triangleGeometry},
			{position: [-1.3, 0], geometry: boxGeometry},
		];
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
			gl.useProgram(this.program);
			if (dimensions == 2) {
				gl.uniform2f(uPosition, ...obj.position);
			} else throw new Error('not implemented for dimensions != 2');
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