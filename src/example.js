import * as K from './kubiki.js';
import { LineBuilder } from './LineBuilder.js';

const rect = K.rect().position(-1.4, 0, 0);
const box = K.box().position(0, -1, 0).scale(2, 2, 2).color(0.3, 1.0, 0.3);

box.on('click', e => {
	const pos = [...box.transform.position];
	box.animate({
		position: [pos[0], pos[1] - 2, pos[2]],
		rotation: [0, 0, 1],
		scale: [2.2, 0.2, 0.2],
	}, 1000);
});

box.on('click', e => {
	console.log("$$$$")
});


let down = false;
let start;
let startPosition;
let startRotation;
box.on('pointermove', e => {
	console.log("ruszanko")
	if (down) {
		const current = {x: e.clientX, y: e.clientY};
		// box.position(startPosition[0] + (current.x - start.y) * 0.002, y => y, z => z);
		box.rotation(
			startRotation[0] + (current.y - start.y) * 0.02,
			startRotation[0] + (current.x - start.x) * 0.02,
			v => v
		);

	}
});

box.on('pointerdown', e => {
	down = true;
	start = {x: e.clientX, y: e.clientY};
	startPosition = [...box.transform.position];
	startRotation = [...box.transform.rotation];
	console.log("DOWN", startPosition)
});

box.on('pointerup', e => {
	down = false;
	console.log("UP")
});


const kubiki = K.init({
		width: 1024, height: 768, background: [0, 0, 0.04, 1],
		camera: {
			fov: Math.PI / 3,
		},
		controls: 'orbit',
	})
	.mount(document.body);

const house = kubiki.load('House.glb');

kubiki
	// .add(rect)
	.add(box)
	.add(house)
	.add(K.box().color(1.0, 0.4, 0.4).position(3, 0, 0).scale(1, 1, 1).on('click', e => {
		console.log("xD", e)
	}))
	.add(K.terrain({ columns: 10, rows: 6}).rotation(-Math.PI/4, 0, 0 ))
	// .add(K.rect().position(1.4, 0))
	// .add(K.triangle())
	// .add(K.triangle().position(0, -2.0));

kubiki.camera.lookAt(0, 0, 0);
function update(t) {
	kubiki.camera.position(x => x + 0.06, v => v, v => v);
	box.color(Math.random() * 0.2 + 0.5, 1.0, 0.0);
	box.rotation(v => v + 0.002, v => v - 0.01, z => z);
	house.rotation(v => v - 0.01, v => v - 0.1, v => v);
	// console.log("BOXO", box.transform.rotation)
	// box.position(x => Math.cos(t * 0.002) * 4, y => Math.sin(t * 0.003) * 5, z => z);
	// rect.scale(x => x + 0.01, y => y + 0.01, 1);
	kubiki.render(t);
	// box.rotation(x => x, y => y + 0.01, z => z + 0.02)
	const angle = t * 0.001;
	const radius = 10;
	// kubiki.camera.position(Math.cos(angle) * radius, Math.sin(t * 0.0003) * radius/2, Math.sin(angle) * radius);
	// kubiki.camera.transform.rotation[1] = Math.sin(t * 0.001) * 0.3;
	// kubiki.camera.rotation(x => x, y => Math.sin(t * 0.001) * 0.3, z => z);
	requestAnimationFrame(update);
}

requestAnimationFrame(update);

{
	const canvas = document.createElement('canvas');
	document.body.append(canvas);
	const ctx = canvas.getContext('2d');

	const lineBuilder = new LineBuilder();
	lineBuilder.turn(Math.PI / 4);
	lineBuilder.forward(100);
	lineBuilder.turn(-0.6);
	lineBuilder.forward(40);
	lineBuilder.turn(-0.6);
	lineBuilder.forward(40);
	lineBuilder.turn(0.6);
	lineBuilder.forward(20);
	// const points = [
	// 	[0, 0],
	// 	[100, 100],
	// 	[100, 120],
	// 	[110, 150],
	// ];
	ctx.beginPath();
	console.log("points", lineBuilder.points)
	lineBuilder.points.forEach(pt => {
		ctx.lineTo(pt[0], pt[1]);
	});
	ctx.stroke();
}
