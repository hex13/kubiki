export class LineBuilder {
	points = [[0, 0]];
	rotation = 0;
	cursor = [0, 0];
	forward(amount) {
		this.cursor[0] += Math.cos(this.rotation) * amount;
		this.cursor[1] += Math.sin(this.rotation) * amount;
		this.points.push([...this.cursor]);
	}
	turn(angle) {
		this.rotation += angle;
	}
}