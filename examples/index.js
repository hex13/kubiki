import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as Kubiki from '../src/kubiki.js';

function createScene() {
    const scene = new THREE.Scene();
    // scene.add((() => {
    //     const geom = new THREE.BoxGeometry(1, 1, 1);
    //     const mat = new THREE.MeshBasicMaterial({color: 'red'});
    //     return new THREE.Mesh(geom, mat);
    // })());
    const room = {
        width: 8,
        height: 5,
    };

    scene.add((() => {
        const geom = new THREE.BufferGeometry();
        const vertices = Kubiki.createFloor(room);
        geom.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
        const mat = new THREE.MeshBasicMaterial({color: 'red'});
        return new THREE.Mesh(geom, mat);
    })());

    scene.add((() => {
        const geom = new THREE.BufferGeometry();
        const vertices = Kubiki.createWalls(room);
        geom.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
        geom.computeVertexNormals();
        const mat = new THREE.MeshLambertMaterial({color: 0x33ff33, side: THREE.DoubleSide});
        return new THREE.Mesh(geom, mat);
    })());

    const light = new THREE.DirectionalLight(0xffffff, 1.0);

    light.position.set(-8, 30, 10);
    light.target.position.set(0, 0, 0);
    scene.add(light);

    return scene;
}

function init({
        container,
        size,
    }) {
    const renderer = new THREE.WebGLRenderer();
    renderer.setClearColor(0x99aaff);
    renderer.setSize(size.width, size.height);
    container.appendChild(renderer.domElement);

    const camera = new THREE.PerspectiveCamera(80, size.width / size.height);
    camera.position.set(0, 20, 0);
    camera.lookAt(0, 0, 0);

    const scene = createScene();

    const controls = new OrbitControls(camera, renderer.domElement);
    return {
        renderer,
        controls,
        scene,
        camera,
    }
}

function loop() {
    app.renderer.render(app.scene, app.camera);

    requestAnimationFrame(loop);
}

const app = init({
    container: document.body,
    size: {
        width: 1024,
        height: 768,
    },
});

loop();