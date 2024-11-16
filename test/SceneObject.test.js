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
		assert.deepStrictEqual(obj.regions, []);
	});
	it('adding objects should change .children and .parent', () => {
		const parent = new SceneObject();
		const child = new SceneObject();

		parent.add(child);

		assert.strictEqual(parent.children.length, 1);
		assert.strictEqual(parent.children[0], child);

		assert.strictEqual(child.parent, parent);
	});

	it('adding objects should trigger .onAdd() on kubiki', () => {
		const events = [];
		const parent = new SceneObject();
		const child = new SceneObject();
		parent.kubiki = {
			onAdd(obj, parent) {
				events.push(['onAdd', obj, parent]);
			},
		};

		parent.add(child);
		assert.strictEqual(events.length, 1);
		const call = events[0];
		assert.strictEqual(call[0], 'onAdd');
		assert.strictEqual(call[1], child);
		assert.strictEqual(call[2], parent);
	});

	it('findRegion()', () => {
		const obj = new SceneObject();
		const a = {
			position: [10, 12, 19],
			size: [3, 6, 11],
		};
		const b = {
			position: [40, 100, 130],
			size: [10, 5, 10],
		};
		const c = {
			position: [150, 100, 130],
			size: [10, 5, 10],
		};

		obj.regions = [
			a, b, c
		];

		// for x out of bounds
		assert.strictEqual(obj.findRegion([39, 101, 131]), null);
		assert.strictEqual(obj.findRegion([50, 101, 131]), null);

		// for y out of bounds
		assert.strictEqual(obj.findRegion([41, 99, 131]), null);
		assert.strictEqual(obj.findRegion([41, 105, 131]), null);

		// for z out of bounds
		assert.strictEqual(obj.findRegion([41, 101, 129]), null);
		assert.strictEqual(obj.findRegion([41, 101, 140]), null);

		for (let x = 40; x < 50; x++) {
			for (let y = 100; y < 105; y++) {
				for (let z = 130; z < 140; z++) {
					assert.strictEqual(obj.findRegion([x, y, z]), b);
				}
			}
		}
	});
});
