import './style.css';
//import './gui.ts'

import { World, Materials, createRenderer, buildScene } from './game.js';

import * as THREE from 'three';

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

async function main(): Promise<void> {
    let renderer = createRenderer();

    // Loading screen: Loading blocks
    let materials = Materials.load_textures('textures/terrain.png');

    // Loading screen: Loading world
    let world = await World.load_world('testworld.cw');

    // check for error
    console.log(world);

    // Loading screen: Placing blocks
    let scene = buildScene(world, materials);

    let camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.x = world.width;
    camera.position.y = world.height;
    camera.position.z = world.length;
    camera.lookAt(new THREE.Vector3(0,0,0));

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 0.5, 0);
    controls.update();
    controls.enablePan = false;
    controls.enableDamping = true;

    function animate() {
        requestAnimationFrame(animate);
        render();
    }

    function render() {
        controls.update();
        renderer.render(scene, camera);
    }

    function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }
    window.addEventListener('resize', onWindowResize);

    animate();
}
main();