import * as THREE from 'https://cdn.skypack.dev/three@0.120.0/build/three.module.js'
import { GLTFLoader } from 'https://cdn.skypack.dev/three@0.120.0/examples/jsm/loaders/GLTFLoader.js'
import { OrbitControls } from 'https://cdn.skypack.dev/three@0.120.0/examples/jsm/controls/OrbitControls.js'
//initiate some global variables
var root = [] //main 3dobject
var root2 = [] //secondary 3dobjects
var texture = []
var imdataDose = []
var imdataOriginalDose = []
var res = 1024*2;
//define model variations
var model = [];
model[0] = {Texture:'WallTextures.png',
            Dosemap:'WallDoseMap.png',
            Model:'WallModel.glb',
            Assets:[]}
model[1] = {Texture:'InnoRenewTextures.png',
            Dosemap:'InnoRenewDoseMap.jpg',
            Model:'InnoRenewHouse.glb',
            Assets:'InnoRenewHouse_misc.glb'}
model[2] = {Texture:'Lekstuga_Texture.png',
            Dosemap:'Lekstuga_Dosemap.png',
            Model:'Lekstuga_1.glb',
            Assets:[]}

// create gui
var gui = new dat.GUI({ autoPlace: false, width: 500 });
gui.domElement.id = 'gui';
gui_container.appendChild(gui.domElement);
// add a range controller
var weathering = { Time: 0 };
var species = { Product: allNames[0]};
var models = { Model: 'Wall Model' };
var slider1 = gui.add(weathering, 'Time', 0, 100);
var dropdown1 = gui.add(species, 'Product', allNames)
var dropdown2 = gui.add(models, 'Model', ["Wall Model", "InnoRenew House", "Lekstuga"])

dropdown1.onChange(function () {
    out = colorMap(this.object.Product)
    wclr = out[0];
    var data = new Uint8Array(4 * res * res);
    var imdata = ctx.getImageData(0, 0, res, res)
    var imdataDose = ctxDose.getImageData(0, 0, canvasDose.width, canvasDose.height)
    var imdataOriginalDose = Uint8ClampedArray.from(imdataDose.data); //clone original imdata
    var time = slider1.object.Time;
    data = mapColor(imdata, imdataOriginalDose, time,res)
    root.children[0].material.map.image.data = data
    root.children[0].material.map.needsUpdate = true
})

dropdown2.onChange(function () {
    scene.remove(root)
    scene.remove(root2)    
    if (dropdown2.object.Model == 'Wall Model') {var id = 0}
    if (dropdown2.object.Model == 'InnoRenew House') {var id = 1}
    if (dropdown2.object.Model == 'Lekstuga') {var id = 2}
    loadNewTexture(id)
    loadNewModel(id)  
    //load any other assets if available
    if (model[1].Assets.length>0) {
        loadNewAssets(id)
    }
    
})

slider1.onChange(function () {
    var data = new Uint8Array(4 * res * res);
    var imdata = ctx.getImageData(0, 0, res, res)
    var imdataDose = ctxDose.getImageData(0, 0, canvasDose.width, canvasDose.height)
    var imdataOriginalDose = Uint8ClampedArray.from(imdataDose.data); //clone original imdata
    var time = this.object.Time;
    data = mapColor(imdata, imdataOriginalDose, time,res)
    root.children[0].material.map.image.data = data
    root.children[0].material.map.needsUpdate = true
})

//select canvas from index.html
const canvas = document.querySelector('.webgl')
//start scene
const scene = new THREE.Scene()

{
    const loader = new THREE.CubeTextureLoader();
    const texture = loader.load([
      './assets/clouds1/clouds1_east.bmp',
      './assets/clouds1/clouds1_west.bmp',
      './assets/clouds1/clouds1_up.bmp',
      './assets/clouds1/clouds1_down.bmp',
      './assets/clouds1/clouds1_north.bmp',
      './assets/clouds1/clouds1_south.bmp',
    ]);
    scene.background = texture;
  }

//light
var hemLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 1);
scene.add(hemLight);
const light = new THREE.PointLight(0xffffff, 5, 100);
light.position.set(50, 50, 50);
scene.add(light);

//window size
const canvasContainer = document.getElementById('modelContainer')
const sizes = {
    width: canvasContainer.width * 4,
    height: canvasContainer.height * 4
}
//create and configure camera

const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.set(5, 1, 1)

scene.add(camera)
//create and configure renderer
const renderer = new THREE.WebGL1Renderer({
    canvas: canvas,
})
//renderer.setClearColor( 0xffffff, 1);
renderer.setSize(sizes.width, sizes.height)
//renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.shadowMap.enabled = true
//create orbit controls
const controls = new OrbitControls(camera, renderer.domElement);

//add 2 canvasesthe for texture and dosemap
var canvasTemp = document.createElement("canvas");
canvasTemp.width = res;
canvasTemp.height = res;
var ctx = canvasTemp.getContext("2d");
var canvasDose = document.createElement("canvas");
canvasDose.width = res;
canvasDose.height = res;
var ctxDose = canvasDose.getContext("2d");
//add canvas to body if inspect 
//document.body.appendChild(canvasTemp) //This is only shown in dev

//Create function for loading a new texture (and run once)
function loadNewTexture(id) {
    //clear both canvas
    ctx.clearRect(0, 0, res, res);
    ctxDose.clearRect(0, 0, res, res); 
    //Draw dosemap on canvas
    var imageDose = new Image()
    imageDose.onload = function () {
        ctxDose.drawImage(imageDose, 0, 0, res, res);
    }
    imageDose.src = './assets/'+model[id].Dosemap;
    //Draw texture on canvas, calculate color and create texture
    var image = new Image()
    image.onload = function () {
        ctx.drawImage(image, 0, 0, res, res);
        var data = new Uint8Array(4 * res * res);
        var imdata = ctx.getImageData(0, 0, res, res);
        var imdataDose = ctxDose.getImageData(0, 0, canvasDose.width, canvasDose.height);
        imdataOriginalDose = Uint8ClampedArray.from(imdataDose.data); 
        var time = 0;
        data = mapColor(imdata, imdataOriginalDose, time,res);
        texture = new THREE.DataTexture(data, res, res);
        texture.flipY = false
        texture.needsUpdate = true;
    }
    image.src = "./assets/" + model[id].Texture
}
loadNewTexture(0)

//Create function for loading a new model (and run once)
function loadNewModel(id) {

    var loader = new GLTFLoader()
    loader.load('./assets/' + model[id].Model, function (glb) {
        console.log(glb)
        root = glb.scene;
        //adjust scale to fit canvas
        root.scale.set(1, 1, 1)
        //add object to scene
        root.traverse((o) => {
            if (o.isMesh) {
                o.material.map = texture
            }
        });
        
        scene.add(root)
        //render single frame
        renderer.render(scene, camera)
        //some extra arguments for loader...
    }, function (xhr) {
        console.log((xhr.loaded / xhr.total * 100) + "% loaded")
    }, function (error) {
        console.log("an error occured)")
    })
}
loadNewModel(0)

function loadNewAssets(id) {
var loader2 = new GLTFLoader()
loader2.load('./assets/'+model[id].Assets, function (glb) {
    console.log(glb)
    root2 = glb.scene;
    //adjust scale to fit canvas
    root2.scale.set(1, 1, 1)
    //add object to scene
    scene.add(root2)
})
}

function resizeCanvasToDisplaySize() {
    const canvas = renderer.domElement;
    // look up the size the canvas is being displayed
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;


    // adjust displayBuffer size to match
    if (canvas.width !== width || canvas.height !== height) {
        // you must pass false here or three.js sadly fights the browser
        renderer.setSize(width, height, false);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        // update any render target sizes here
    }
}

//define animate function
function animate() {
    resizeCanvasToDisplaySize()
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}
animate()
