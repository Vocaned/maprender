import './nbt.js'

import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { defaultBlocks } from './defaultblocks';

class Environment {
    sun = 0xffffff;
    shadow = 0x9b9b9b;
    sky = 0x99ccff;
    fog = 0xffffff;
    fogAmount = 4096;
}


class Block {
    sprite = false;
    drawtype = 0; // Opaque
    fullbright = false;
    top;
    side; // This also determines sprite textures
    bottom;
    minX = 0;
    minY = 0;
    minZ = 0;
    maxX = 16;
    maxY = 16;
    maxZ = 16;
}

class BlockDefs {
    list = []
    constructor() {
        for (let b in defaultBlocks) {
            let bl = new Block();
            bl.sprite = defaultBlocks[b][0];
            bl.top = defaultBlocks[b][1];
            bl.side = defaultBlocks[b][2];
            bl.bottom = defaultBlocks[b][3];
            bl.drawtype = defaultBlocks[b][4];
            bl.fullbright = defaultBlocks[b][5];
            bl.minX = defaultBlocks[b][6];
            bl.minY = defaultBlocks[b][7];
            bl.minZ = defaultBlocks[b][8];
            bl.maxX = defaultBlocks[b][9];
            bl.maxY = defaultBlocks[b][10];
            bl.maxZ = defaultBlocks[b][11];
            this.list.push(bl);
        }
    }
}

export class World {
    width = 0;
    height = 0;
    length = 0;
    blocks = [];
    blockDefs = new BlockDefs();
    env = new Environment();

    constructor(arr) {
        nbt.parse(arr, (error, data) => {
            if (error) { throw error; }
            if (data.name !== 'ClassicWorld') { console.error('Invalid nbt name! Got', data.name); }

            this.width = data.value.X.value;
            this.height = data.value.Y.value;
            this.length = data.value.Z.value;

            this.blocks = data.value.BlockArray.value;
        });
    }

    coordsToIndex(x, y, z) {
        return x + this.width * (z + y * this.length)
    }

    shouldCull(curBlock, x, y, z) {
        let index = this.coordsToIndex(x, y, z);
        let block = this.blocks[index];
        let curBlockdef = this.blockDefs.list[curBlock];
        let blockdef = this.blockDefs.list[block];
        if (blockdef.drawtype === 4) return false;
        if (block >= 8 && block <= 11 && (curBlock < 8 || curBlock > 11)) return false; // Cull liquids touching each other
        if (curBlockdef.drawtype == 0 && blockdef.drawtype != 0) return false;
        if (block === 18) return false; // Don't cull leaves TODO: fix z-fighting
        return !blockdef.sprite;
    }

    static async load_world(path) {
        return await fetch(path).then(resp => resp.arrayBuffer()).then(arr => new World(arr));
    }
}

const BlockGeometries = new function() {
    this.px = new THREE.PlaneGeometry(1, 1);
    this.px.rotateY(Math.PI / 2);
    this.px.translate(0.5, 0, 0);

    this.nx = new THREE.PlaneGeometry(1, 1);
    this.nx.rotateY(-Math.PI / 2);
    this.nx.translate(-0.5, 0, 0);

    this.py = new THREE.PlaneGeometry(1, 1);
    this.py.rotateX(-Math.PI / 2);
    this.py.translate(0, 0.5, 0);

    this.ny = new THREE.PlaneGeometry(1, 1);
    this.ny.rotateX(Math.PI / 2);
    this.ny.translate(0, -0.5, 0);

    this.pz = new THREE.PlaneGeometry(1, 1);
    this.pz.translate(0, 0, 0.5);

    this.nz = new THREE.PlaneGeometry(1, 1);
    this.nz.rotateY(Math.PI);
    this.nz.translate(0, 0, -0.5);

    const sprite1 = new THREE.PlaneGeometry(1, 1);
    sprite1.rotateY(Math.PI / 4);

    const sprite2 = new THREE.PlaneGeometry(1, 1);
    sprite2.rotateY(-Math.PI / 4);
    sprite2.uv = sprite1.uv

    this.sprite = mergeGeometries([sprite1, sprite2])
}()

export class Materials {
    textures;
    opaque;
    transparent; // Sprites must always be transparent
    transdoublesided;
    // translucent
    constructor(texture) {
        this.opaque = new THREE.MeshLambertMaterial({
            map: texture
        });

        this.transparent = new THREE.MeshLambertMaterial({
            map: texture,
            transparent: true,
            side: THREE.DoubleSide // WIP
        });

        this.transdoublesided = new THREE.MeshLambertMaterial({ // TODO: Not used for anything yet
            map: texture,
            transparent: true,
            side: THREE.DoubleSide
        });
    }

    static load_textures(path) {
        const textures = new THREE.TextureLoader().load(path);
        textures.magFilter = THREE.NearestFilter;
        textures.minFilter = THREE.NearestFilter;

        return new Materials(textures);
    }
}

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

function setBlockSize(geometry, blockdef) {
}

export function buildScene(world, materials) {
    let scene = new THREE.Scene();

    // Sky color
    scene.background = new THREE.Color(0xd0e7ff); // TODO: how is this calculated in cc? sky + fog?

    const shadow = new THREE.AmbientLight(world.env.shadow);
    scene.add(shadow);

    const sun = new THREE.DirectionalLight(world.env.sun, 0.4);
    sun.position.set( 1, 1, 0.5 ).normalize();
    scene.add(sun);

    let opaqueGeometries = [];
    let transparentGeometries = [];
    const matrix = new THREE.Matrix4();
    for (let x = 0; x < world.width; x++) {
        for (let y = 0; y < world.height; y++) {
            for (let z = 0; z < world.length; z++) {

                const index = world.coordsToIndex(x, y, z);
                const block = world.blocks[index];
                const blockdef = world.blockDefs.list[block];
                if (blockdef.drawtype === 4) continue // Skip air and gas blocks

                matrix.makeTranslation(
                    x - world.width / 2,
                    y,
                    z - world.length / 2
                );

                let geometries = []
                if (blockdef.sprite) {
                    let geometry = BlockGeometries.sprite.clone().applyMatrix4(matrix);
                    setTexture(geometry, blockdef.side); // Sprite blocks are textured by their side tex
                    geometries.push(geometry);
                } else {
                    if (y+1 === world.height || !world.shouldCull(block, x, y+1, z)) {
                        let geometry = BlockGeometries.py.clone().applyMatrix4(matrix);

                        setTexture(geometry, blockdef.top);
                        setBlockSize(geometry, blockdef);
                        geometries.push(geometry);
                    }
                    if (y === 0 || !world.shouldCull(block, x, y-1, z)) {
                        let geometry = BlockGeometries.ny.clone().applyMatrix4(matrix);

                        setTexture(geometry, blockdef.bottom);
                        setBlockSize(geometry, blockdef);
                        geometries.push(geometry);
                    }
                    if (x+1 === world.width || !world.shouldCull(block, x+1, y, z)) {
                        let geometry = BlockGeometries.px.clone().applyMatrix4(matrix);

                        setTexture(geometry, blockdef.side);
                        setBlockSize(geometry, blockdef);
                        geometries.push(geometry);
                    }
                    if (x === 0 || !world.shouldCull(block, x-1, y, z)) {
                        let geometry = BlockGeometries.nx.clone().applyMatrix4(matrix);

                        setTexture(geometry, blockdef.side);
                        setBlockSize(geometry, blockdef);
                        geometries.push(geometry);
                    }
                    if (z+1 === world.length || !world.shouldCull(block, x, y, z+1)) {
                        let geometry = BlockGeometries.pz.clone().applyMatrix4(matrix);

                        setTexture(geometry, blockdef.side);
                        setBlockSize(geometry, blockdef);
                        geometries.push(geometry);
                    }
                    if (z === 0 || !world.shouldCull(block, x, y, z-1)) {
                        let geometry = BlockGeometries.nz.clone().applyMatrix4(matrix);

                        setTexture(geometry, blockdef.side);
                        setBlockSize(geometry, blockdef);
                        geometries.push(geometry);
                    }
                }

                if (geometries.length === 0) continue;

                if (blockdef.sprite || blockdef.drawtype > 0) transparentGeometries.push(...geometries);
                else opaqueGeometries.push(...geometries);
            }
        }
    }

    if (opaqueGeometries.length > 0) {
        let opaqueGeometry = mergeGeometries(opaqueGeometries);
        opaqueGeometry.computeBoundingSphere();
        let opaqueMesh = new THREE.Mesh(opaqueGeometry, materials.opaque);
        opaqueMesh.name = 'worldmesh';
        scene.add(opaqueMesh);
    }

    if (transparentGeometries.length > 0) {
        let transparentGeometry = mergeGeometries(transparentGeometries);
        transparentGeometry.computeBoundingSphere();
        let transparentMesh = new THREE.Mesh(transparentGeometry, materials.transparent);
        transparentMesh.name = 'worldmesh';
        scene.add(transparentMesh);
    }

    return scene;
}

export function createRenderer() {
    // Clear everything from body to remove old renderers
    document.body.innerHTML = '';

    const renderer = new THREE.WebGLRenderer({antialias: false});
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
    return renderer;
}