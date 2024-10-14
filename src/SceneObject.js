export class SceneObject {
	transform = {
		position: [0, 0],
	};
	constructor(geometry) {
		this.geometry = geometry;
	}
	position(x, y) {
		const { position } = this.transform;
		position[0] = x;
		position[1] = y;
		return this;
	}
}
