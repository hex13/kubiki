export const vertexShaderSource = `
attribute vec2 aPosition;
uniform vec2 uPosition;
uniform mat4 uTransform;
uniform mat4 uProjection;
#define SCALE 0.5
void main() {
	gl_Position = uProjection * uTransform * vec4(aPosition, 0.0, 1.0);
}
`;

export const fragmentShaderSource = `
void main() {
	gl_FragColor = vec4(1.0, 0.0, 1.0, 1.0);
}
`;