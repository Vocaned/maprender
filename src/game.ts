import { nbt } from './nbt';

import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { Block, defaultBlocks } from './defaultblocks';

class Environment {
    sun = 0xffffff;
    shadow = 0x9b9b9b;
    sky = 0x99ccff;
    fog = 0xffffff;
    fogAmount = 4096;
}


class BlockDefs {
    list: Record<number, Block> = {};
    constructor() {
        this.list = {...defaultBlocks};
    }
}

export class World {
    width = 0;
    height = 0;
    length = 0;
    blocks = [];
    blockDefs = new BlockDefs();
    env = new Environment();

    constructor(arr: ArrayBuffer) {
        // TODO: fix types
        nbt.parse(arr, (error: any, data: any) => {
            if (error) { throw error; }
            if (data.name !== 'ClassicWorld') { console.error('Invalid nbt name! Got', data.name); }

            this.width = data.value.X.value;
            this.height = data.value.Y.value;
            this.length = data.value.Z.value;

            this.blocks = data.value.BlockArray.value;
        });
    }

    coordsToIndex(x: number, y: number, z: number) {
        return x + this.width * (z + y * this.length)
    }

    shouldCull(curBlock: number, x: any, y: any, z: any) {
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

    static async load_world(path: URL | string) {
        const resp = await fetch(path);
        const arr = await resp.arrayBuffer();
        return new World(arr);
    }
}

const BlockGeometries = {
    px: new THREE.PlaneGeometry(1, 1).rotateY(Math.PI / 2).translate(0.5, 0, 0),
    nx: new THREE.PlaneGeometry(1, 1).rotateY(-Math.PI / 2).translate(-0.5, 0, 0),
    py: new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2).translate(0, 0.5, 0),
    ny: new THREE.PlaneGeometry(1, 1).rotateX(Math.PI / 2).translate(0, -0.5, 0),
    pz: new THREE.PlaneGeometry(1, 1).translate(0, 0, 0.5),
    nz: new THREE.PlaneGeometry(1, 1).rotateY(Math.PI).translate(0, 0, -0.5),
    sprite: (function() {
        const sprite1 = new THREE.PlaneGeometry(1, 1);
        sprite1.rotateY(Math.PI / 4);

        const sprite2 = new THREE.PlaneGeometry(1, 1);
        sprite2.rotateY(-Math.PI / 4);
        sprite2.setAttribute("uv", sprite1.getAttribute("uv"))

        return mergeGeometries([sprite1, sprite2]);
    })(),
};


export class Materials {
    texture: THREE.Texture;
    opaque;
    transparent; // Sprites must always be transparent
    transdoublesided;
    // translucent
    constructor(texture: THREE.Texture) {
        texture.colorSpace = THREE.SRGBColorSpace;

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

        this.texture = texture;
    }

    static load_textures(path: string) {
        const textures = new THREE.TextureLoader().load(path);
        textures.magFilter = THREE.NearestFilter;
        textures.minFilter = THREE.NearestFilter;

        return new Materials(textures);
    }
}

function setTexture(geometry: THREE.BufferGeometry, tex: number) {
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

function setBlockSize(geometry: any, blockdef: any) {
}

export function buildScene(world: World, materials: Materials) {
    let scene = new THREE.Scene();

    // Sky color
    scene.background = new THREE.Color(0xd0e7ff); // TODO: how is this calculated in cc? sky + fog?

    // https://discourse.threejs.org/t/updates-to-lighting-in-three-js-r155/53733
    const shadow = new THREE.AmbientLight(world.env.shadow, Math.PI);
    scene.add(shadow);

    const sun = new THREE.DirectionalLight(world.env.sun, 0.5 * Math.PI);
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