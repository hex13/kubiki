import * as K from './kubiki.js';

const rect = K.rect().position(-1.4, 0, 0);
const box = K.box().position(-3, 5, -4);
const kubiki = K.init({width: 1024, height: 768, background: [0, 0, 0.4, 1]})
	.mount(document.body)
	.add(rect)
	.add(box)
	// .add(K.rect().position(1.4, 0))
	// .add(K.triangle())
	// .add(K.triangle().position(0, -2.0));

function update(t) {
	rect.position(x => x + 0.04, y => y, z => z);
	box.position(x => x + 0.04, y => Math.sin(t * 0.003) * 5, z => z);
	kubiki.render(t);
	requestAnimationFrame(update);
}

requestAnimationFrame(update);