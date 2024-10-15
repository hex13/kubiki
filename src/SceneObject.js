export class SceneObject {
	transform = {
		position: [0, 0, 0, 1],
		scale: [1, 1, 1],
		rotation: [0, 0, 0],
	};
	constructor(geometry) {
		this.geometry = geometry;
	}
	position(x, y, z) {
		const { position } = this.transform;
		position[0] = typeof x == 'function'? x(position[0]) : x;
		position[1] = typeof y == 'function'? y(position[1]) : y;
		position[2] = typeof z == 'function'? z(position[2]) : z;
		return this;
	}
}
