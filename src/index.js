import './style.css'
import * as THREE from 'three';

import './nbt.js'

import { OrbitControls } from './OrbitControls.js';
import { mergeBufferGeometries } from './BufferGeometryUtils';
import { GUI } from 'dat.gui'

window.addEventListener('resize', onWindowResize);

// init renderer
const renderer = new THREE.WebGLRenderer({antialias: false});
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const texture = new THREE.TextureLoader().load('textures/terrain.png');
texture.magFilter = THREE.NearestFilter;
texture.minFilter = THREE.NearestFilter;

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

// init scene
const scene = new THREE.Scene();

// Sky color
scene.background = new THREE.Color(0xbfd1e5);

// Sun
const light = new THREE.AmbientLight(0xffffff);
scene.add(light);

const blockMaterial = new THREE.MeshLambertMaterial({
    map: texture,
    transparent: true,
    side: THREE.DoubleSide
});

const params = {
    'mipmaps': false,
    'x': 64,
    'y': 0,
    'z': 64,
    'arr': '...'
}
const maps = ['bigsample.cw', 'samplemap.cw']
const texpacks = ['default']

const gui = new GUI()
const mapFolder = gui.addFolder('Map')
mapFolder.add(params, 'arr', maps).name('Map List')
mapFolder.add(params, 'arr', texpacks).name('Texture Pack')
mapFolder.open()
const camFolder = gui.addFolder('Camera')
camFolder.add(params, 'mipmaps').name('Mipmaps').onChange(function(mipmaps) {
    blockMaterial.map = new THREE.TextureLoader().load('textures/terrain.png');
    blockMaterial.map.magFilter = THREE.NearestFilter;

    if (mipmaps) blockMaterial.map.minFilter = THREE.NearestMipmapLinearFilter;
    else blockMaterial.map.minFilter = THREE.NearestFilter;
});
camFolder.add(params, 'x').name('Center X')
camFolder.add(params, 'y').name('Center Y')
camFolder.add(params, 'z').name('Center Z')
camFolder.open()

function setTexture(geometry, tex) {
    let uv = geometry.attributes.uv;

    const width = 16;
    const height = 16;

    const y = (height-1) - Math.floor(tex / 16);
    const x = tex % 16;

    uv.setXY(0, x/width, (y+1)/height);
    uv.setXY(1, (x+1)/width, (y+1)/height);
    uv.setXY(2, x/width, y/height);
    uv.setXY(3, (x+1)/width, y/height);

    if (uv.count === 8) { // sprite
        uv.setXY(4, x/width, (y+1)/height);
        uv.setXY(5, (x+1)/width, (y+1)/height);
        uv.setXY(6, x/width, y/height);
        uv.setXY(7, (x+1)/width, y/height);
    }

    uv.needsUpdate = true;
}

function setBlockSize(geometry, minX, minY, maxX, maxY) {

}

const matrix = new THREE.Matrix4();

const pxGeometry = new THREE.PlaneGeometry(1, 1);
pxGeometry.rotateY(Math.PI / 2);
pxGeometry.translate(0.5, 0, 0);

const nxGeometry = new THREE.PlaneGeometry(1, 1);
nxGeometry.rotateY(-Math.PI / 2);
nxGeometry.translate(-0.5, 0, 0);

const pyGeometry = new THREE.PlaneGeometry(1, 1);
pyGeometry.rotateX(-Math.PI / 2);
pyGeometry.translate(0, 0.5, 0);

const nyGeometry = new THREE.PlaneGeometry(1, 1);
nyGeometry.rotateX(Math.PI / 2);
nyGeometry.translate(0, -0.5, 0);

const pzGeometry = new THREE.PlaneGeometry(1, 1);
pzGeometry.translate(0, 0, 0.5);

const nzGeometry = new THREE.PlaneGeometry(1, 1);
nzGeometry.rotateY(Math.PI);
nzGeometry.translate(0, 0, -0.5);

let spriteGeometry;
{
    const sprite1 = new THREE.PlaneGeometry(1, 1);
    sprite1.rotateY(Math.PI / 4);

    const sprite2 = new THREE.PlaneGeometry(1, 1);
    sprite2.rotateY(-Math.PI / 4);
    sprite2.uv = sprite1.uv

    const sprites = [
        sprite1, sprite2
    ]

    spriteGeometry = mergeBufferGeometries(sprites)

}


let blocklist = {
    // ID: sprite, top, px, pz, nx, nz, bottom, minX, minY, minZ, maxX, maxY, maxZ

    // px, pz, nx, nz, bottom are unused for sprites, texture is determined by top
    // TODO: Match behaviour with cc ^
    1: [false, 1, 1, 1, 1, 1, 1, 0, 0, 0, 16, 16, 16],
    2: [false, 0, 3, 3, 3, 3, 2, 0, 0, 0, 16, 16, 16],
    3: [false, 2, 2, 2, 2, 2, 2, 0, 0, 0, 16, 16, 16],
    8: [false, 14, 14, 14, 14, 14, 14, 0, 0, 0, 16, 15, 16],
    9: [false, 14, 14, 14, 14, 14, 14, 0, 0, 0, 16, 15, 16],
    10: [false, 30, 30, 30, 30, 30, 30, 0, 0, 0, 16, 15, 16],
    11: [false, 30, 30, 30, 30, 30, 30, 0, 0, 0, 16, 15, 16],
    12: [false, 18, 18, 18, 18, 18, 18, 0, 0, 0, 16, 16, 16],
    13: [false, 19, 19, 19, 19, 19, 19, 0, 0, 0, 16, 16, 16],
    14: [false, 32, 32, 32, 32, 32, 32, 0, 0, 0, 16, 16, 16],
    15: [false, 33, 33, 33, 33, 33, 33, 0, 0, 0, 16, 16, 16],
    16: [false, 34, 34, 34, 34, 34, 34, 0, 0, 0, 16, 16, 16],
    17: [false, 21, 20, 20, 20, 20, 21, 0, 0, 0, 16, 16, 16],
    18: [false, 22, 22, 22, 22, 22, 22, 0, 0, 0, 16, 16, 16],
    37: [true, 13, 13, 13, 13, 13, 13, 0, 0, 0, 16, 16, 16],
    38: [true, 12, 12, 12, 12, 12, 12, 0, 0, 0, 16, 16, 16],
    39: [true, 29, 29, 29, 29, 29, 29, 0, 0, 0, 16, 16, 16],
    40: [true, 28, 28, 28, 28, 28, 28, 0, 0, 0, 16, 16, 16]
}

function coordsToIndex(x, y, z) {
    return x + worldWidth * (z + y * worldLength)
}

function shouldCull(curBlock, x, y, z) {
    let index = coordsToIndex(x, y, z);
    let block = blocks[index];
    if (!block || block === 0) return false;
    if (block >= 8 && block <= 11 && (curBlock < 8 || curBlock > 11)) return false; // Cull liquids touching each other
    if (block === 18) return false; // Don't cull leaves TODO: fix z-fighting
    return !blocklist[block][0]; //true for sprites, false for blocks
}


const geometries = [];

let worldWidth, worldHeight, worldLength, blocks;

await fetch('bigsample.cw').then(resp => resp.arrayBuffer()).then(arr => {
    nbt.parse(arr, function(error, data) {
        if (error) { throw error; }
        if (data.name !== 'ClassicWorld') { console.error('Invalid nbt name! Got', data.name); }

        worldWidth = data.value.X.value;
        worldHeight = data.value.Y.value;
        worldLength = data.value.Z.value;

        blocks = data.value.BlockArray.value;
    });
});

for (let x = 0; x < worldWidth; x++) {
    for (let y = 0; y < worldHeight; y++) {
        for (let z = 0; z < worldLength; z++) {

            const index = coordsToIndex(x, y, z);
            const block = blocks[index];
            if (block === 0) continue

            matrix.makeTranslation(
                x - worldWidth / 2,
                y,
                z - worldLength / 2
            );

            let textures = blocklist[block];

            if (textures[0]) {
                let geometry = spriteGeometry.clone().applyMatrix4(matrix);

                if (textures) setTexture(geometry, textures[1]);
                geometries.push(geometry);
                continue;
            }

            if (!shouldCull(block, x, y+1, z) || y+1 === worldHeight) {
                let geometry = pyGeometry.clone().applyMatrix4(matrix);

                if (textures) setTexture(geometry, textures[1]);
                if (textures) setBlockSize(geometry, textures[7], textures[8], textures[9], textures[10], textures[11], textures[12])

                geometries.push(geometry);
            }
            if (!shouldCull(block, x, y-1, z) || y === 0) {
                let geometry = nyGeometry.clone().applyMatrix4(matrix);

                if (textures) setTexture(geometry, textures[6]);
                if (textures) setBlockSize(geometry, textures[7], textures[8], textures[9], textures[10], textures[11], textures[12])

                geometries.push(geometry);
            }
            if (!shouldCull(block, x+1, y, z) || x+1 === worldWidth) {
                let geometry = pxGeometry.clone().applyMatrix4(matrix);

                if (textures) setTexture(geometry, textures[2]);
                if (textures) setBlockSize(geometry, textures[7], textures[8], textures[9], textures[10], textures[11], textures[12])

                geometries.push(geometry);
            }
            if (!shouldCull(block, x-1, y, z) || x === 0) {
                let geometry = nxGeometry.clone().applyMatrix4(matrix);
                if (textures) setBlockSize(geometry, textures[7], textures[8], textures[9], textures[10], textures[11], textures[12])

                if (textures) setTexture(geometry, textures[4]);

                geometries.push(geometry);
            }
            if (!shouldCull(block, x, y, z+1) || z+1 === worldLength) {
                let geometry = pzGeometry.clone().applyMatrix4(matrix);

                if (textures) setTexture(geometry, textures[3]);
                if (textures) setBlockSize(geometry, textures[7], textures[8], textures[9], textures[10], textures[11], textures[12])

                geometries.push(geometry);
            }
            if (!shouldCull(block, x, y, z-1) || z === 0) {
                let geometry = nzGeometry.clone().applyMatrix4(matrix);

                if (textures) setTexture(geometry, textures[5]);
                if (textures) setBlockSize(geometry, textures[7], textures[8], textures[9], textures[10], textures[11], textures[12])

                geometries.push(geometry);
            }
        }
    }
}


const geometry = mergeBufferGeometries(geometries);
geometry.computeBoundingSphere();

const mesh = new THREE.Mesh(geometry, blockMaterial);
scene.add(mesh);

camera.position.x = worldWidth;
camera.position.y = worldHeight;
camera.position.z = worldLength;

camera.lookAt(scene.position);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 0.5, 0);
controls.update();
controls.enablePan = false;
controls.enableDamping = true;

const axes = new THREE.AxesHelper(2);
scene.add(axes);

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

animate();