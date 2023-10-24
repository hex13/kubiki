import * as THREE from '../node_modules/three/src/Three.js';

function createScene() {
    const scene = new THREE.Scene();
    scene.add((() => {
        const geom = new THREE.BoxGeometry(1, 1, 1);
        const mat = new THREE.MeshBasicMaterial({color: 'red'});
        return new THREE.Mesh(geom, mat);
    })());

    return scene;
}

function init({
        container,
        size,
    }) {
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(size.width, size.height);
    container.appendChild(renderer.domElement);

    const camera = new THREE.PerspectiveCamera(80, size.width / size.height);
    camera.position.set(0, 20, 0);
    camera.lookAt(0, 0, 0);

    const scene = createScene();

    renderer.render(scene, camera);
}

init({
    container: document.body,
    size: {
        width: 1024,
        height: 768,
    },
});
