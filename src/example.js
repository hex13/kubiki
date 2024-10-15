import * as K from './kubiki.js';

const box = K.box().position(-1.4, 0);
const kubiki = K.init({width: 1024, height: 768, background: [0, 0, 0.4, 1]})
	.mount(document.body)
	.add(box)
	.add(K.box().position(1.4, 0))
	.add(K.triangle())
	.add(K.triangle().position(0, -2.0));

function update(t) {
	box.position(x => x + 0.01, y => y - 0.02);
	kubiki.render(t);
	requestAnimationFrame(update);
}

requestAnimationFrame(update);