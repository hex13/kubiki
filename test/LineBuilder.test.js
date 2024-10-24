import * as assert from 'assert';
import { LineBuilder } from '../src/LineBuilder.js';

describe('LineBuilder', () => {
	it('initial state', () => {
		const builder = new LineBuilder();
		assert.deepStrictEqual(builder.points, [[0,0]]);
		assert.deepStrictEqual(builder.rotation, 0);
		assert.deepStrictEqual(builder.cursor, [0, 0]);
	});
	it('forward', () => {
		const builder = new LineBuilder();

		builder.forward(1.5);
		assert.deepStrictEqual(builder.rotation, 0);
		assert.deepStrictEqual(builder.cursor, [1.5, 0]);
		assert.deepStrictEqual(builder.points, [[0, 0], [1.5, 0]]);

		builder.forward(2.5);
		assert.deepStrictEqual(builder.rotation, 0);
		assert.deepStrictEqual(builder.cursor, [4, 0]);
		assert.deepStrictEqual(builder.points, [[0, 0], [1.5, 0], [4, 0]]);
	});

	it('turn', () => {
		const builder = new LineBuilder();
		builder.cursor = [1.4, 6];
		builder.turn(0.6);
		assert.deepStrictEqual(builder.rotation, 0.6);
		assert.deepStrictEqual(builder.cursor, [1.4, 6]);
		assert.deepStrictEqual(builder.points, [[0,0]]);

		builder.turn(0.2);
		assert.deepStrictEqual(builder.rotation, 0.8);
		assert.deepStrictEqual(builder.cursor, [1.4, 6]);
		assert.deepStrictEqual(builder.points, [[0,0]]);

		builder.turn(-0.1);
		assert.ok(Math.abs(builder.rotation - 0.7) < Number.EPSILON);
		assert.deepStrictEqual(builder.cursor, [1.4, 6]);
		assert.deepStrictEqual(builder.points, [[0,0]]);
	});
	it('turn & forward', () => {
		const builder = new LineBuilder();

		const angle = 0.123;
		builder.turn(angle)
		builder.forward(1.5);
		assert.deepStrictEqual(builder.rotation, angle);
		assert.deepStrictEqual(builder.cursor, [Math.cos(angle) * 1.5, Math.sin(angle) * 1.5]);
		assert.deepStrictEqual(builder.points, [[0, 0], [Math.cos(angle) * 1.5, Math.sin(angle) * 1.5]]);
	});
});

