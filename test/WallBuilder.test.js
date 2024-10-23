import * as assert from 'assert';
import { WallBuilder } from '../src/WallBuilder.js';

describe('WallBuilder', () => {
	it('initial state', () => {
		const builder = new WallBuilder();
		assert.deepStrictEqual(builder.cursor, [0, 0, 0]);
		assert.deepStrictEqual(builder.walls, []);
	});

	it('forward', () => {
		const builder = new WallBuilder();
		builder.forward(1.5);
		assert.deepStrictEqual(builder.cursor, [1.5, 0, 0]);
		assert.deepStrictEqual(builder.walls, [
			{from: [0, 0, 0], to: [1.5, 0, 0]},
		]);
	});

	it('turn + forward', () => {
		const builder = new WallBuilder();
		const angle1 = 0.6;
		const angle2 = 0.2;
		const A = [Math.cos(angle1) * 1.5, Math.sin(angle1) * 1.5, 0];
		const B = [A[0] + Math.cos(angle1 + angle2) * 1.2, A[1] + Math.sin(angle1 + angle2) * 1.2, 0]

		builder.turn(angle1);
		builder.forward(1.5);

		assert.deepStrictEqual(builder.cursor, A);

		builder.turn(angle2);
		builder.forward(1.2);

		assert.deepStrictEqual(builder.cursor, B);

		assert.deepStrictEqual(builder.walls, [
			{from: [0, 0, 0], to: A},
			{from: A, to: B},
		]);
	});
});