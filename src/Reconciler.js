const nop = () => {};

export class Reconciler {
	constructor(handlers, onAdd = nop, onRemove = nop) {
		this.handlers = handlers;
		this.instances = Object.create(null);
		this.onAdd = onAdd;
		this.onRemove = onRemove;
	}
	update(newState, extra) {
		Object.entries(newState).forEach(([k, v]) => {
			if (Object.hasOwn(this.handlers, k)) {
				const newInstance = this.handlers[k](k, v, this.instances[k], extra);
				const prevInstance = this.instances[k];
				if (!newInstance) {
					this.onRemove(prevInstance);
				}
				if (newInstance) {
					if (prevInstance) {
						if (prevInstance != newInstance) {
							this.onRemove(prevInstance);
							this.onAdd(newInstance);
						}
					} else {
						this.onAdd(newInstance);
					}

				}
				this.instances[k] = newInstance;
			}
		});
	}
}