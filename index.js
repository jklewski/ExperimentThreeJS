import * as THREE from 'https://cdn.skypack.dev/three@0.120.0/build/three.module.js'
import { GLTFLoader } from 'https://cdn.skypack.dev/three@0.120.0/examples/jsm/loaders/GLTFLoader.js'
import { OrbitControls } from 'https://cdn.skypack.dev/three@0.120.0/examples/jsm/controls/OrbitControls.js'

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
const light = new THREE.DirectionalLight(0xffffff, 1)
light.position.set(2, 2, 5)
light.intensity = 2
scene.add(light)

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
var grdDose = ctxDose.createLinearGradient(0, 0, 0, 1000)
grdDose.addColorStop(0, "#000000");
grdDose.addColorStop(1, "white");
ctxDose.fillStyle = grdDose;
ctxDose.fillRect(0, 0, 1024, 1024);
var imdataDose = ctxDose.getImageData(0, 0, canvasDose.width, canvasDose.height)
var imdataOriginalDose = Uint8ClampedArray.from(imdataDose.data); //clone original imdata
document.body.appendChild(canvasDose) //This is only shown in dev

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
    const data = new Uint8Array(4 * size);
    //Manipulate color here... creating a bufferarray for image data
    //TODO: change this to color based on data from InnoRenew
    var value = []
    for (let i = 0; i < imdata.data.length; i += 4) {
        value = 10*imdataOriginalDose[i]/256
        let idHigh = imdata.data[i] + 256 * Math.ceil(value)
        let idLow = imdata.data[i] + 256 * Math.floor(value)
        data[i] = wclr.R[idLow] + (wclr.R[idHigh] - wclr.R[idLow]) * (value - Math.floor(value));
        data[i + 1] = wclr.G[idLow] + (wclr.G[idHigh] - wclr.G[idLow]) * (value - Math.floor(value));
        data[i + 2] = wclr.B[idLow] + (wclr.B[idHigh] - wclr.B[idLow]) * (value - Math.floor(value));
        data[i + 3] = 256
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
    loader.load('/assets/TestSphere.glb', function (glb) {
        console.log(glb)
        var root = glb.scene;
        //overwrite existing mesh with manipulated material
        root.traverse((o) => {
            if (o.isMesh) {
                o.material = material//.emissive = new THREE.Color( 0x0000ff );
            }
        });
        //adjust scale to fit canvas
        root.scale.set(0.4, 0.4, 0.4)
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
image.src = "./assets/TestSphereTextures.jpg"

//script will now jump back to onload function --^