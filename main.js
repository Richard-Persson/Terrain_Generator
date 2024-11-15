import * as THREE from 'three'
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls'
import * as dat from 'dat.gui'


window.onload = function init(){

  //Trenger disse for at THREEJS skal kjøre
  const renderer = new THREE.WebGLRenderer()
  document.body.appendChild(renderer.domElement)

  //Laste inn bilder
  const loader = new THREE.TextureLoader()
  const texture = loader.load('./static/terrain2.jpeg')
  const height = loader.load('./static/heightMap2.png')
  const sphereImage = loader.load('./static/terrain1.png')

  //GUI
  const gui = new dat.GUI()

  //Lager scenen
  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth/window.innerHeight,
    0.1,
    100,
  )

  //Setter posisjonen
  camera.position.set(0,5,20)

  //Lager akse og grid for hjelp
  const gridHelper = new THREE.GridHelper(50)
  scene.add(gridHelper)
  const axesHelper = new THREE.AxesHelper(5)
  scene.add(axesHelper)

  //Lager OrbitControls
  const orbit = new OrbitControls(camera,renderer.domElement) 
  scene.add(orbit)


  
  //Lys
  const pointLight = new THREE.PointLight(0xffffff,100)
  scene.add(pointLight)
  pointLight.position.x = 1
  pointLight.position.y =20 
  pointLight.position.z = 1
  
  //GUI for lys posisjon
  gui.add(pointLight.position,"x")
  gui.add(pointLight.position,"y")
  gui.add(pointLight.position,"z")

  //For å se posisjonen på lyset
  const plHelper = new THREE.PointLightHelper(pointLight, 2)
  scene.add(plHelper)


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
  const planeGeometry = new THREE.PlaneGeometry(50,50,128,128)
  const planeMaterial = new THREE.MeshStandardMaterial({
    map:texture,
    displacementMap:height,
    displacementScale:10,
  })

  const plane = new THREE.Mesh(planeGeometry,planeMaterial)
  scene.add(plane)
  plane.rotation.x = -0.5*Math.PI 




  //Animerer scenen
  function animate(time) {

    sphere.rotation.y = time/1000

    renderer.render(scene,camera)
  }

  renderer.setSize(window.innerWidth,window.innerHeight)
  renderer.setAnimationLoop(animate)
}
