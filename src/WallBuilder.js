export class WallBuilder {
	constructor() {
		this.cursor = [0, 0, 0];
		this._rotationZ = 0;
		this.walls = [];
	}
	forward(amount) {
		const from = [...this.cursor];
		this.cursor[0] += Math.cos(this._rotationZ) * amount;
		this.cursor[1] += Math.sin(this._rotationZ) * amount;

		this.walls.push({
			from,
			to: [...this.cursor],
		});
	}
	turn(angle) {
		this._rotationZ += angle;
	}
}