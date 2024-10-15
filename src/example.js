import * as K from './kubiki.js';

const rect = K.rect().position(-1.4, 0, 0);
const box = K.box().position(-3, 5, 0);
const kubiki = K.init({width: 1024, height: 768, background: [0, 0, 0.4, 1]})
	.mount(document.body)
	.add(rect)
	.add(box)
	// .add(K.rect().position(1.4, 0))
	// .add(K.triangle())
	// .add(K.triangle().position(0, -2.0));

function update(t) {
	// rect.position(x => x + 0.04, y => y, z => z);
	// box.position(x => Math.cos(t * 0.002) * 4, y => Math.sin(t * 0.003) * 5, z => z);
	kubiki.render(t);
	// kubiki.camera.position(0, 0, Math.sin(t * 0.001) * 5 + 10)
	kubiki.camera.transform.rotation[1] = Math.sin(t * 0.001) * 0.3;
	requestAnimationFrame(update);
}

requestAnimationFrame(update);