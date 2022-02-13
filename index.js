import * as THREE from 'https://cdn.skypack.dev/three@0.120.0/build/three.module.js'
import { GLTFLoader } from 'https://cdn.skypack.dev/three@0.120.0/examples/jsm/loaders/GLTFLoader.js'
import { OrbitControls } from 'https://cdn.skypack.dev/three@0.120.0/examples/jsm/controls/OrbitControls.js'

// create gui
var gui = new dat.GUI();
// add a range controller
var weathering = {time: 5};
var species = {name: 'spruce'};
gui.add(weathering, 'time', 0, 100);
gui.add(species, 'name');

gui.__controllers[0].onChange(function() {
    console.log('test')
    var imdata = ctx.getImageData(0, 0, 1024, 1024)
    const width = 1024;
    const height = 1024;
    const size = width * height;
    var data = new Uint8Array(4 * size);


    var imdataDose = ctxDose.getImageData(0, 0, canvasDose.width, canvasDose.height)
    var imdataOriginalDose = Uint8ClampedArray.from(imdataDose.data); //clone original imdata
    //var value = this.object.time/10
    var value = [];
    for (let i = 0; i < imdata.data.length; i += 4) {
    //calculate dose at pixel i
        value = (this.object.time/100) * (10*imdataOriginalDose[i]/255)
        let idHigh = imdata.data[i] + 255 * Math.ceil(value)
        let idLow = imdata.data[i] + 255 * Math.floor(value)
        data[i] = Math.pow((wclr.R[idLow] + (wclr.R[idHigh] - wclr.R[idLow]) * (value - Math.floor(value)))/255,2.2)*255;
        data[i + 1] = Math.pow((wclr.G[idLow] + (wclr.G[idHigh] - wclr.G[idLow]) * (value - Math.floor(value)))/255,2.2)*255;
        data[i + 2] = Math.pow((wclr.B[idLow] + (wclr.B[idHigh] - wclr.B[idLow]) * (value - Math.floor(value)))/255,2.2)*255;
        data[i + 3] = 255
    }
    // Use the buffer to create a texture, using DataTExture
    // Make sure texture is updated
    scene.children[3].children[0].material.map.image.data = data
    scene.children[3].children[0].material.map.needsUpdate = true
})
// create a buffer with color data. A buffer is just an array representing pixels, for example Uint8Array
// https://developer.mozilla.org/en-US/docs/Web/API/ArrayBufferView

// DONE: load 3d object + apply texture image separately 
// DONE: load texture image and load to buffer
// TODO: use apply color to buffer from species data
// TODO: load dose map and use to apply color


//select canvas from index.html
const canvas = document.querySelector('.webgl')
//start scene
const scene = new THREE.Scene()
//define light
//const light = new THREE.DirectionalLight(0xffffff, 1)
//light.position.set(2, 2, 5)
//light.intensity = 1
//scene.add(light)
var hemLight = new THREE.HemisphereLight(0xffffff, 0xffffff, .7);
scene.add(hemLight);
//const light2 = new THREE.AmbientLight(0xffffff,5)
//light2.position.set(1, 1, 3)
//light2.intensity = 0.1
//scene.add(light2)

//window size
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}
//create and configure camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.set(0, 0, 3)
scene.add(camera)
//create and configure renderer
const renderer = new THREE.WebGL1Renderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.shadowMap.enabled = true
//create orbit controls
const controls = new OrbitControls(camera, renderer.domElement);
//define animate function
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

//add the actual model and textures
var canvasTemp = document.createElement("canvas"); 
canvasTemp.width = 1024;
canvasTemp.height = 1024;
var ctx = canvasTemp.getContext("2d");
//add canvas to body if inspect 
document.body.appendChild(canvasTemp) //This is only shown in dev

//add the dosemap, should have same dimension as texture
const canvasDose = document.createElement("canvas"); 
canvasDose.width = 1024;
canvasDose.height = 1024;
const ctxDose = canvasDose.getContext("2d");
var imageDose = new Image()
imageDose.onload = function () {
    ctxDose.drawImage(imageDose, 0, 0, 1024, 1024);
}
imageDose.src = './assets/InnoRenewDoseMap.jpg'
document.body.appendChild(canvasDose) //This is only shown in dev
var imdataDose = ctxDose.getImageData(0, 0, canvasDose.width, canvasDose.height)
var imdataOriginalDose = Uint8ClampedArray.from(imdataDose.data); //clone original imdata

//create empty image
var image = new Image()

//Put entire block of material creation in onload function because.. gave up trying to force wait... 
//TODO: add await function to texture onload.
image.onload = function () {
    //draw image on temporary canvas
    ctx.drawImage(image, 0, 0, 1024, 1024);
    //get image data
    var imdata = ctx.getImageData(0, 0, 1024, 1024)
    const width = 1024;
    const height = 1024;
    const size = width * height;
    var data = new Uint8Array(4 * size);
    //Manipulate color here... creating a bufferarray for image data
    //TODO: change this to color based on data from InnoRenew
    var value = []
    for (let i = 0; i < imdata.data.length; i += 4) {
        value = (imdataOriginalDose[i]/255)*10
        let idHigh = imdata.data[i] + 255 * Math.ceil(value)
        let idLow = imdata.data[i] + 255 * Math.floor(value)
        data[i] = Math.pow((wclr.R[idLow] + (wclr.R[idHigh] - wclr.R[idLow]) * (value - Math.floor(value)))/255,2.2)*255;
        data[i + 1] = Math.pow((wclr.G[idLow] + (wclr.G[idHigh] - wclr.G[idLow]) * (value - Math.floor(value)))/255,2.2)*255;
        data[i + 2] = Math.pow((wclr.B[idLow] + (wclr.B[idHigh] - wclr.B[idLow]) * (value - Math.floor(value)))/255,2.2)*255;
        data[i + 3] = 255
    }
    // Use the buffer to create a texture, using DataTExture
    // Make sure texture is updated
    var texture = new THREE.DataTexture(data, width, height);
    texture.flipY = false
    texture.needsUpdate = true;
    // create new basic material and apply texture
    var material = new THREE.MeshBasicMaterial({ map: texture });
    material.encoding = THREE.sRGBEncoding;
    //load .glb model
    var loader = new GLTFLoader()
    loader.load('./assets/InnoRenewHouse.glb', function (glb) {
        console.log(glb)
        var root = glb.scene;
        //overwrite existing mesh with manipulated material
        root.traverse((o) => {
            if (o.isMesh) {
                o.material.map = texture//
                //material.emissive = new THREE.Color( 0xffffff );
            }
        });
        //adjust scale to fit canvas
        root.scale.set(1, 1, 1)
        //add object to scene
        scene.add(root)
        //render single frame
        renderer.render(scene, camera)
        //animage to allow orbit
        animate()
        //some extra arguments for loader...
    }, function (xhr) {
        console.log((xhr.loaded / xhr.total * 100) + "% loaded")
    }, function (error) {
        console.log("an error occured)")
    })
}

//set im source.. 
image.src = "./assets/InnoRenewTextures.png"

//Load misc other assets
var loader2 = new GLTFLoader()
loader2.load('./assets/InnoRenewHouse_misc.glb', function (glb) {
    console.log(glb)
    var root2 = glb.scene;
    //adjust scale to fit canvas
    root2.scale.set(1, 1, 1)
    //add object to scene
    scene.add(root2)
})
//script will now jump back to onload function --^