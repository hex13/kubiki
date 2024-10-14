export function init(params) {
	return new Kubiki(params);
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
		return this;
	}
}