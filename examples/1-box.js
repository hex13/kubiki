import * as K from '../src/kubiki.js';

const box = K.box().position(0, -1, 0).scale(2, 2, 2).color(0.3, 1.0, 0.3)
	.on('click', () => {
		alert('clicked');
	});

const kubiki = K.init({
		width: 1024, height: 768, controls: 'orbit',
	}).mount(document.body);

kubiki.add(box);

function update(t) {
	kubiki.render(t);
	box.rotation(x => x + 0.03, y => y + 0.01, z => z);
	requestAnimationFrame(update);
}

requestAnimationFrame(update);