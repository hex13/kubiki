export const vertexShaderSource = `
precision mediump float;
attribute vec3 aPosition;
uniform vec2 uPosition;
uniform mat4 uTransform;
uniform mat4 uProjection;
uniform mat4 uView;
varying vec3 vPosition;
#define SCALE 0.5
void main() {
	gl_Position = uProjection * uView * uTransform * vec4(aPosition, 1.0);
	vPosition = aPosition;
}
`;

export const fragmentShaderSource = `
precision mediump float;
varying  vec3 vPosition;
void main() {
	float a = vPosition.x * 0.3 + vPosition.y * 0.2; + vPosition.z * 0.1;
	gl_FragColor = vec4(0.5 + a, vPosition.x, vPosition.z, 1.0);
}
`;