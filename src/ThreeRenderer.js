import { Renderer } from './renderer.js';
import { SceneObject } from './SceneObject.js';

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export class ThreeRenderer extends Renderer{
	constructor(gl, params, kubiki) {
		super(gl, params, kubiki);
		this.renderer = new THREE.WebGLRenderer();
		this.renderer.setSize(params.width, params.height);
		this.renderer.setClearColor(new THREE.Color(...params.background));
		this.renderer.clear();
		this.canvas = this.renderer.domElement;
		document.body.append(this.canvas);

		this.scene = new THREE.Scene();

		const mesh = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshLambertMaterial({color: 'green'}));
		// this.scene.add(mesh);
		this.camera = new THREE.PerspectiveCamera(params.camera.fov / Math.PI * 180, params.width / params.height);

		const light = new THREE.DirectionalLight()
		light.position.set(0, 1, 1);
		this.scene.add(light);

		const ambientLight = new THREE.AmbientLight(0x333333);
		this.scene.add(ambientLight);

		this.raycaster = new THREE.Raycaster();

		const gltfLoader = new GLTFLoader();
		this.kubiki.addLoader(url => {
			const obj = new SceneObject({vertices: new Float32Array, normals: new Float32Array});
			const threeMesh = new THREE.Object3D();
			gltfLoader.load(url, gltf => {
				threeMesh.add(gltf.scene.clone());
			});
			obj.threeMesh = threeMesh;
			return obj;
		});

		this.camera.position.set(...this.kubiki.camera.transform.position);

		if (params.controls == 'orbit') {
			this.cameraControls = new OrbitControls(this.camera, gl.canvas);
		}
	}
	enableEvent(eventType) {
		const { canvas } = this;
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
		// if (obj.coords != '3D') return;
		this.objects.push(obj);
		let geom;
		if (!obj.threeMesh) {
			const mat = new THREE.MeshLambertMaterial({color: 'green'});
			if (obj.geometry) {
				geom = new THREE.BufferGeometry();
				geom.setAttribute('position', new THREE.BufferAttribute(obj.geometry.vertices, 3));
				geom.setAttribute('normal', new THREE.BufferAttribute(obj.geometry.normals, 3));
			}
			if (obj.instanced) {
				if (obj.room) {
					const instanceCount = obj.room.walls.reduce((count, wall) => {
						return count + wall.doors.length + 1;
					}, 0);
					console.log('insta', instanceCount)
					const mesh = new THREE.InstancedMesh(geom, mat, instanceCount);
					mesh.geometry = geom;
					obj.threeMesh = mesh;

					const { room } = obj;
					const dummy = new THREE.Object3D();

					for (let i = 0; i < mesh.count; i++) {
						dummy.scale.set(0, 0, 0);
						dummy.updateMatrix();
						mesh.setMatrixAt(i, dummy.matrix);
					}
					let idx = 0;
					let x = 0;
					let y = 0;
					let isVertical = false;
					let rotation = 0;
					const nextPos = (length) => {
						const dx = Math.cos(rotation) * length;
						const dy = Math.sin(rotation) * length;
						x += dx;
						y += dy;
					}
					const nextWall = (length) => {
						const dx = Math.cos(rotation) * length;
						const dy = Math.sin(rotation) * length;
						dummy.position.set(x + dx / 2, y + dy / 2, 0);
						nextPos(length);
						dummy.scale.set(length, room.wallThickness, 1);
						dummy.rotation.set(0, 0, rotation);
						dummy.updateMatrix();
						mesh.setMatrixAt(idx, dummy.matrix);
						idx++;
					};

					for (let i = 0; i < 4; i++) {
						const wall = room.walls[i];
						let length = i % 2 == 0? room.width : room.height - 2 * room.wallThickness;
						if (wall.doors.length) {
							let lastPos = 0;
							for (let doorIdx = 0; doorIdx < wall.doors.length; doorIdx++) {
								nextWall(wall.doors[doorIdx] - lastPos);
								nextPos(room.doorLength);
								lastPos = wall.doors[doorIdx] + room.doorLength;
							}
							if (lastPos < length) {
								nextWall(length - lastPos);
							}
						} else {
							nextWall(length);
						}

						if (i % 2 == 0) {
							nextPos(-room.wallThickness / 2);
							rotation += Math.PI / 2;
							nextPos(room.wallThickness / 2);
						} else {
							nextPos(room.wallThickness / 2);
							rotation += Math.PI / 2;
							nextPos(-room.wallThickness / 2);
						}
					}
				}

			} else {
				const mesh = new THREE.Mesh(geom, mat);
				mesh.position.set(...obj.transform.position);
				obj.threeMesh = mesh;
			}
		}

		if (obj.threeMesh) {
			obj.threeMesh.userData.obj = obj;
			this.scene.add(obj.threeMesh);
		}
	}
	remove(obj) {
		super.remove(obj);
		if (obj.threeMesh) {
			obj.threeMesh.removeFromParent();
		}
	}
	render() {
		const { camera } = this;
		const { width, height } = this.params;
		const v = new THREE.Vector3();
		this.objects.forEach((obj, i) => {
			const { position, rotation, scale } = obj.transform;
			const { color } = obj.transform.material;

			const mesh = obj.threeMesh;
			if (mesh) {
				mesh.position.set(position[0], position[1], position[2]);
				mesh.rotation.set(rotation[0], rotation[1], rotation[2]);
				mesh.scale.set(scale[0], scale[1], scale[2]);
				if (mesh.material) {
					mesh.material.color.set(color[0], color[1], color[2])
				}
			}
			if (obj.coords == '2D') {
				v.set(obj.transform.position[0], obj.transform.position[1], obj.transform.position[2]);
				v.project(camera);
				obj.transform.projected = [(v.x / 2 + 0.5) * width, (-v.y / 2 + 0.5) * height];
			}
		});

		if (!this.cameraControls) {
			this.camera.position.set(...this.kubiki.camera.transform.position);
		}

		this.renderer.render(this.scene, this.camera);
	}
}