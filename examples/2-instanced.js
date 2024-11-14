import * as K from '../src/kubiki.js';

const box = K.room({
	width: 6,
	height: 4,
	wallThickness: 0.2,
	doorLength: 1,
	walls: [
		{doors: [3]},
		{doors: []},
		{doors: []},
		{doors: []},
	],
}).position(0, -1, 0).scale(2, 2, 2).color(0.3, 1.0, 0.3)
	.on('click', () => {
		alert('clicked');
	});

const kubiki = K.init({
		width: 1024, height: 768, controls: 'orbit',
	}).mount(document.body);

kubiki.add(box);
kubiki.add(K.box());

function update(t) {
	kubiki.render(t);
	box.rotation(x => x + 0.003, y => y + 0.001, z => z);
	requestAnimationFrame(update);
}

requestAnimationFrame(update);