import * as THREE from 'three'
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls'
import * as dat from 'dat.gui'
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader'


window.onload = function init(){

  //Trenger disse for at THREEJS skal kjøre
  const renderer = new THREE.WebGLRenderer()
  document.body.appendChild(renderer.domElement)


  //Loaders
  const textureLoader = new THREE.TextureLoader()
  const gltfLoader = new GLTFLoader()


  //Laste inn bilder
  const texture = textureLoader.load('./static/terrain2.jpeg')
  const height = textureLoader.load('./static/heightMap2.png')
  const sphereImage = textureLoader.load('./static/terrain1.png')

  //Laste inn modeller 
  const bush = gltfLoader.load('./models/bush/scene.gltf',(gltfScene)=>{

    gltfScene.scene.position.set(-25,11,14)
    gltfScene.scene.scale.set(5,5,5)
    gltfScene.scene.rotation.set(10,0,0)

    scene.add(gltfScene.scene)
  })


  //GUI
  const gui = new dat.GUI()

  //Lager scenen
  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth/window.innerHeight,
    0.1,
    300,
  )

  //Setter posisjonen
  camera.position.set(30,40,40)

  //Lager akse og grid for hjelp
  const gridHelper = new THREE.GridHelper(50)
  scene.add(gridHelper)
  const axesHelper = new THREE.AxesHelper(5)
  scene.add(axesHelper)

  //Lager OrbitControls
  const orbit = new OrbitControls(camera,renderer.domElement) 


  
  //Lys
  const directinalLight = new THREE.DirectionalLight(0xffffff,1)
  scene.add(directinalLight)
  directinalLight.position.x = 1
  directinalLight.position.y =20 
  directinalLight.position.z = 1
  
  //GUI for lys posisjon
  gui.add(directinalLight.position,"x")
  gui.add(directinalLight.position,"y")
  gui.add(directinalLight.position,"z")

  //For å se posisjonen på lyset
  const dlHelper = new THREE.DirectionalLightHelper(directinalLight, 2)
  scene.add(dlHelper)


  //Bakgrunn
  renderer.setClearColor('#96c9d7')


  //Sphere
  const sphereGeometry = new THREE.SphereGeometry()
  const sphereMaterial = new THREE.MeshPhongMaterial({
    color:'red',
    map:sphereImage,
  })
  const sphere = new THREE.Mesh(sphereGeometry,sphereMaterial)
  scene.add(sphere)
  sphere.position.y = 5
  sphere.position.x = 3

  

  
  //Plane

  const uniforms = {
    bumpTexture:{value: height},
    bumpScale: {value: 26},
  }
  const planeGeometry = new THREE.PlaneGeometry(100,100,128,128)
  //NY
  const planeMaterial = new THREE.ShaderMaterial({
    uniforms: uniforms,
    vertexShader: document.getElementById('vertexShader').textContent,
    fragmentShader: document.getElementById('fragmentShader').textContent,

  })
  //GAMMEL
  /**const planeMaterial = new THREE.MeshStandardMaterial({
    map:texture,
    displacementMap:height,
    displacementScale:26,
  })**/

  const plane = new THREE.Mesh(planeGeometry,planeMaterial)
  scene.add(plane)
  plane.rotation.x = -0.5*Math.PI 


  gui.add(uniforms.bumpScale, 'value', 0, 100).name('Displacement Scale');


  //Animerer scenen
  function animate(time) {

    sphere.rotation.y = time/1000

    renderer.render(scene,camera)
  }

  renderer.setSize(window.innerWidth,window.innerHeight)
  renderer.setAnimationLoop(animate)
}
