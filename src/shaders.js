export const vertexShaderSource = `
precision mediump float;
attribute vec3 aPosition;
attribute vec3 aNormal;

uniform vec2 uPosition;
uniform mat4 uTransform;
uniform mat4 uProjection;
uniform mat4 uView;

varying vec3 vPosition;
varying vec4 vNormal;

void main() {
	gl_Position = uProjection * uView * uTransform * vec4(aPosition, 1.0);
	vPosition = aPosition;
	vNormal = uTransform * vec4(aNormal, 1.0);
}
`;

export const fragmentShaderSource = `
precision mediump float;
varying vec3 vPosition;
varying vec4 vNormal;
void main() {
	vec4 lightDirection = normalize(vec4(0.0, 0.0, -1.0, 1.0));
	float light = dot(-lightDirection, normalize(vNormal)) * 0.5;
	float a = 0.5 + light;
	// float a = vPosition.x * 0.3 + vPosition.y * 0.2; + vPosition.z * 0.1;
	gl_FragColor = vec4(a, a, a, 1.0);
}
`;