import { GUI } from 'dat.gui'

/*const params = {
    'axes': false,
    'mipmaps': false,
    'x': 64,
    'y': 0,
    'z': 64,
    'arr': '...'
}
const maps = ['testworld', 'bigsample.cw', 'samplemap.cw']
const texpacks = ['default']

const gui = new GUI()


const mapFolder = gui.addFolder('Map')
mapFolder.add(params, 'arr', maps).name('Map').setValue(maps[0])
mapFolder.add(params, 'arr', texpacks).name('Texture Pack').setValue(texpacks[0])
mapFolder.open()

const envFolder = gui.addFolder('Env')
envFolder.addColor(env, 'fog').name('Fog')
envFolder.addColor(env, 'sun').name('Sun')
envFolder.addColor(env, 'shadow').name('Shadow')
envFolder.addColor(env, 'sky').name('Sky')
envFolder.add(env, 'fogAmount', 1, 4096, 256).name('Fog Distance')
envFolder.open()

const camFolder = gui.addFolder('Camera')
camFolder.add(params, 'mipmaps').name('Mipmaps').onChange(function(mipmaps) {
    const texture = new THREE.TextureLoader().load('textures/terrain.png');
    texture.magFilter = THREE.NearestFilter;

    if (mipmaps) texture.minFilter = THREE.NearestMipmapLinearFilter;
    else texture.minFilter = THREE.NearestFilter;

    blockMaterial.map = texture;
    transparentMaterial.map = texture;
});
camFolder.add(params, 'axes').name('Axes').onChange(function(b) {
    if (b) {
        scene.add(axes);
    } else {
        scene.remove(axes);
    }
});
camFolder.add(params, 'x').name('Center X')
camFolder.add(params, 'y').name('Center Y')
camFolder.add(params, 'z').name('Center Z')
camFolder.open()*/
