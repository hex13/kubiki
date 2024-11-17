import * as K from '../src/kubiki.js';

const kubiki = K.init({
		width: 1024, height: 768, controls: 'orbit',
	}).mount(document.body);

const box = K.box().position(0, -1, 0).scale(2, 2, 2).color(0.3, 1.0, 0.3)
kubiki.add(box);
const secondBox =  K.box().position(1, 0, 0).scale(0.5, 0.5, 0.5).color(1.0, 1.0, 0.3);
const child =  K.box().position(1.2, 0, 0).scale(0.2, 0.2, 0.2).color(1.0, 1.0, 0.3);
kubiki.add(secondBox);
box.add(child);
function update(t) {
	kubiki.render(t);
	box.rotation(x => x + 0.04, y => y + 0.02, z => z);
	secondBox.position(...box.localToWorld([1, 0, 0]));
	requestAnimationFrame(update);
}

requestAnimationFrame(update);