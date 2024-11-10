import * as assert from 'assert';
import { Reconciler } from '../src/Reconciler.js';

describe('Reconciler', () => {
	const setup = () => {
		let id = 0;
		const events = [];
		const handler = new Reconciler({
			building(key, value, instance) {
				events.push(['building', value, instance]);
				if (!value) return null;
				if (instance) {
					instance.rev++;
					return instance;
				}
				switch (value.kind) {
					case 'woodcutter': return {id: ++id, text: '🌲', rev: 1};
				}
			},
			terrain(key, value, instance) {
				events.push(['terrain', value, instance]);
				switch (value) {
					case 'water': return {on: '💧'};
				}
			},
			// NOTE
			// despite not using directly in tests, this method is still needed
			// to ensure that it won't be called
			foo(key, value, instance) {
				events.push(['foo', value, instance]);
				return {isFoo: true, why: 'it should not be called'};
			}
		});
		return {handler, events};
	};

	it('initial state of a handler', () => {
		const { handler, events } = setup();
		assert.deepStrictEqual(events, [])
		assert.deepStrictEqual(handler.instances, Object.create(null))
	});

	it('lifecycle: onAdd and onRemove should be triggered', () => {
		let events = [];
		const first = {};
		const second = {};
		const onAdd = (instance) => {
			events.push(['onAdd', instance]);
		};
		const onRemove = (instance) => {
			events.push(['onRemove', instance]);
		};
		const reconciler = new Reconciler({
			building(k, v, instance) {
				if (!v) return null;
				return v.what;
			}
		}, onAdd, onRemove);

		events = [];
		reconciler.update({
			building: {what: first},
		});
		assert.deepStrictEqual(events.length, 1);
		assert.strictEqual(events[0][0], 'onAdd');
		assert.strictEqual(events[0][1], first);

		events = [];
		reconciler.update({
			building: {what: first}
		});
		assert.deepStrictEqual(events.length, 0);

		events = [];
		reconciler.update({
			building: {what: second}
		});
		assert.deepStrictEqual(events.length, 2);
		assert.strictEqual(events[0][0], 'onRemove');
		assert.strictEqual(events[0][1], first);
		assert.strictEqual(events[1][0], 'onAdd');
		assert.strictEqual(events[1][1], second);

		events = [];
		reconciler.update({
			building: null,
		});
		assert.deepStrictEqual(events.length, 1);
		assert.strictEqual(events[0][0], 'onRemove');
		assert.strictEqual(events[0][1], second);
	});

	it('updating the same field should remember the instance', () => {
		const { handler, events } = setup();

		handler.update({
			building: {kind: 'woodcutter'},
		});

		const instance = handler.instances.building;
		assert.deepStrictEqual({...handler.instances}, {
			building: {id: 1, text: '🌲', rev: 1},
		});

		handler.update({
			building: {kind: 'woodcutter'},
		});

		assert.deepStrictEqual({...handler.instances}, {
			building: {id: 1, text: '🌲', rev: 2}
		});

		handler.update({
			building: null,
		});

		assert.deepStrictEqual({...handler.instances}, {
			building: null,
		});

		handler.update({
			building: {kind: 'woodcutter'},
		});

		assert.deepStrictEqual({...handler.instances}, {
			building: {id: 2, text: '🌲', rev: 1},
		});

		assert.strictEqual(events.length, 4);
		events.forEach(e => {
			assert.strictEqual(e[0], 'building');
		})
		assert.strictEqual(events[0][2], undefined);
		assert.strictEqual(events[1][2], instance);
		assert.strictEqual(events[2][2], instance);
		assert.strictEqual(events[3][2], null);
	});

	it('updating multiple fields should trigger appropriate handlers', () => {
		const { handler, events } = setup();
		handler.update({
			building: {kind: 'woodcutter'},
			terrain: 'water',
		});
		assert.deepStrictEqual({...handler.instances}, {
			building: {id: 1, text: '🌲', rev: 1},
			terrain: {on: '💧'},
		});
		assert.deepStrictEqual(events.map(e => e[0]), ['building', 'terrain'])
	});

	it('should pass key param', () => {
		const events = [];
		const reconciler = new Reconciler({
			forest: (key, value, instance, extra) => {
				events.push([key]);
			},
		});
		reconciler.update({
			forest: true,
		});
		assert.strictEqual(events[0][0], 'forest');
	});

	it('should pass extra param', () => {
		const extra = {foo: 123};
		const events = [];
		const reconciler = new Reconciler({
			foo: (key, value, instance, extra) => {
				events.push(['foo', extra]);
			},
		});
		reconciler.update({
			foo: 'water',
		}, extra);
		assert.strictEqual(events[0][1], extra);
		assert.deepStrictEqual(events[0][1], {foo: 123});
	});
});
