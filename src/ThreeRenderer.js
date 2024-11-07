import { Renderer } from './renderer.js';
import * as THREE from 'three';

export class ThreeRenderer extends Renderer{
	constructor(gl, params, kubiki) {
		super(gl, params, kubiki);
		this.renderer = new THREE.WebGLRenderer({ context: gl });
		this.renderer.setSize(params.width, params.height);
		this.renderer.setClearColor(new THREE.Color(...params.background));
		this.renderer.clear();

		this.scene = new THREE.Scene();

		const mesh = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshLambertMaterial({color: 'green'}));
		// this.scene.add(mesh);
		this.camera = new THREE.PerspectiveCamera(params.camera.fov / Math.PI * 180, params.width / params.height);

		const light = new THREE.DirectionalLight()
		light.position.set(0, 1, 1);
		this.scene.add(light);

		this.raycaster = new THREE.Raycaster();
	}
	enableEvent(eventType) {
		const { gl } = this;
		const { canvas } = gl;
		canvas.addEventListener(eventType, e => {
			const bounds = e.target.getBoundingClientRect();
			const w = canvas.width;
			const h = canvas.height;
			const x = (e.clientX - bounds.x) / w * 2 - 1;
			const y = -(e.clientY - bounds.y) / h * 2 + 1;
			this.raycaster.setFromCamera({x, y}, this.camera);
			const intersections = this.raycaster.intersectObjects(this.scene.children);
			if (intersections.length) {
				const obj = intersections[0].object.userData.obj;
				if (obj) {
					obj.emit(e.type, e);
				}
			}
		});
	}
	add(obj) {
		console.log("ADD", obj.geometry)
		let geom = new THREE.BufferGeometry();
		geom.setAttribute('position', new THREE.BufferAttribute(obj.geometry.vertices, 3));
		geom.setAttribute('normal', new THREE.BufferAttribute(obj.geometry.normals, 3));
		// geom = new THREE.BoxGeometry(1, 1, 1);
		const mat = new THREE.MeshLambertMaterial({color: 'green'});
		const mesh = new THREE.Mesh(geom, mat);
		mesh.position.set(...obj.transform.position);
		mesh.userData.obj = obj;
		obj.threeMesh = mesh;
		this.scene.add(mesh);
	}
	render() {
		this.objects.forEach((obj, i) => {
			const { position, rotation, scale } = obj.transform;
			const { color} = obj.material;

			const mesh = obj.threeMesh;
			mesh.position.set(position[0], position[1], position[2]);
			mesh.rotation.set(rotation[0], rotation[1], rotation[2]);
			mesh.scale.set(scale[0], scale[1], scale[2]);
			mesh.material.color.set(color[0], color[1], color[2])
		});
		// const [cameraX, cameraY, cameraZ] = this.kubiki.camera.transform.position;
		this.camera.position.set(...this.kubiki.camera.transform.position);
		this.renderer.render(this.scene, this.camera);
	}
}