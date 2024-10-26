export class LineBuilder {
	points = [[0, 0]];
	lines = [];
	rotation = 0;
	cursor = [0, 0];
	isHidden = false;
	forward(amount) {
		const from = [...this.cursor];
		this.cursor[0] += Math.cos(this.rotation) * amount;
		this.cursor[1] += Math.sin(this.rotation) * amount;
		const to = [...this.cursor];
		if (!this.isHidden) {
			this.points.push(to);
			this.lines.push({
				from,
				to,
			});
		}
		return this;
	}
	turn(angle) {
		this.rotation += angle;
		return this;
	}
	hidden() {
		this.isHidden = true;
		return this;
	}
	visible() {
		this.isHidden = false;
		return this;
	}
}