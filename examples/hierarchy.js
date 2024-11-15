import * as K from '../src/kubiki.js';

const kubiki = K.init({
		width: 1024, height: 768, controls: 'orbit',
	}).mount(document.body);

const box = K.box().position(0, -1, 0).scale(2, 2, 2).color(0.3, 1.0, 0.3)
kubiki.add(box);
const child =  K.box().position(1, 0, 0).scale(0.5, 0.5, 0.5).color(0.5, 1.0, 0.3);
kubiki.add(child, box);
const grandchild =  K.box().position(1, 0, 0).scale(0.25, 0.25, 0.25).color(0.8, 1.0, 0.4);
kubiki.add(grandchild, child);

function update(t) {
	kubiki.render(t);
	box.rotation(x => x + 0.04, y => y + 0.02, z => z);
	child.position(x => x + 0.01, y => y, z => z);
	grandchild.position(x => x, y => Math.cos(t * 0.0003) * 3, z => z);
	requestAnimationFrame(update);
}

requestAnimationFrame(update);