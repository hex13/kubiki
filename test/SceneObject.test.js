import * as assert from 'assert';
import { mat4 } from 'gl-matrix';
import { SceneObject } from '../src/SceneObject.js';

describe('SceneObject', () => {
	it('initial state', () => {
		const obj = new SceneObject();
		assert.deepStrictEqual(obj.transform, {
			position: [0, 0, 0, 1],
			rotation: [0, 0, 0],
			scale: [1, 1, 1],
			material: {
				color: [1, 1, 1],
			},
			matrix: mat4.create(),
			target: null,
		});
		assert.deepStrictEqual(obj.children, []);
	});
	it('adding objects', () => {
		const parent = new SceneObject();
		const child = new SceneObject();

		parent.add(child);

		assert.strictEqual(parent.children.length, 1);
		assert.strictEqual(parent.children[0], child);

		assert.strictEqual(child.parent, parent);
	});
});
