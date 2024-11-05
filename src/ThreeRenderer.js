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
		this.camera = new THREE.PerspectiveCamera(45, params.width / params.height);

		const light = new THREE.DirectionalLight()
		light.position.set(0, 1, 1);
		this.scene.add(light);

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
		obj.threeMesh = mesh;
		this.scene.add(mesh);
	}
	render() {
		this.objects.forEach((obj, i) => {
			const { position, rotation, scale } = obj.transform;

			const mesh = obj.threeMesh;
			mesh.position.set(position[0], position[1], position[2]);
			mesh.rotation.set(rotation[0], rotation[1], rotation[2]);
			mesh.scale.set(scale[0], scale[1], scale[2]);
		});
		// const [cameraX, cameraY, cameraZ] = this.kubiki.camera.transform.position;
		this.camera.position.set(...this.kubiki.camera.transform.position);
		this.renderer.render(this.scene, this.camera);
	}
}