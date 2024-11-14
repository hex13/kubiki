export const vertexShaderSource = `
precision mediump float;
attribute vec3 aPosition;
attribute vec3 aNormal;
attribute mat4 aTransform;

uniform vec2 uPosition;
uniform mat4 uTransform;
uniform mat4 uProjection;
uniform mat4 uView;
uniform bool uInstanced;

varying vec3 vPosition;
varying vec4 vNormal;

void main() {
	if (uInstanced) {
		// instancing
		gl_Position = uProjection * uView * uTransform * aTransform * vec4(aPosition, 1.0);
		vPosition = aPosition;
		vNormal = aTransform * vec4(aNormal, 1.0);

	} else {
		gl_Position = uProjection * uView * uTransform * vec4(aPosition, 1.0);
		vPosition = aPosition;
		vNormal = uTransform * vec4(aNormal, 1.0);

	}
}
`;

export const fragmentShaderSource = `
precision mediump float;

uniform vec3 uColor;
uniform int uObjectIndex;

varying vec3 vPosition;
varying vec4 vNormal;


void main() {
	if (uObjectIndex > 0) {
		gl_FragColor = vec4(float(uObjectIndex) / 255.0, 0.0, 1.0, 1.0);
		return;
	}
	vec4 lightDirection = normalize(vec4(0.3, 0.0, -1.0, 1.0));
	float light = dot(-lightDirection, normalize(vNormal)) * 0.5;
	float a = 0.4 + light;
	gl_FragColor = vec4(
		min(1.0, a * uColor.r),
		min(1.0, a * uColor.g),
		min(1.0, a * uColor.b),
		1.0
	);
}
`;