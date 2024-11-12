import * as THREE from 'three'
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls'
import * as dat from 'dat.gui'


window.onload = function init(){

  //Trenger disse for at THREEJS skal kjøre
  const renderer = new THREE.WebGLRenderer()
  document.body.appendChild(renderer.domElement)

  //Laste inn bilder
  const loader = new THREE.TextureLoader()
  const texture = loader.load('./static/terrain.png')
  const height = loader.load('./static/heightMap.png')

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
  camera.position.set(0,3,4)

  //Lager akse og grid for hjelp
  const gridHelper = new THREE.GridHelper(10)
  scene.add(gridHelper)
  const axesHelper = new THREE.AxesHelper(5)
  scene.add(axesHelper)

  //Lager OrbitControls
  const orbit = new OrbitControls(camera,renderer.domElement) 
  scene.add(orbit)


  //Lys
  const pointLight = new THREE.PointLight(0xffffff,2)
  scene.add(pointLight)
  pointLight.position.x = 1
  pointLight.position.y = 4
  pointLight.position.z = 1


  //Sphere
  const sphereGeometry = new THREE.SphereGeometry()
  const sphereMaterial = new THREE.MeshPhongMaterial({color:0x98765})
  const sphere = new THREE.Mesh(sphereGeometry,sphereMaterial)
  scene.add(sphere)
  sphere.position.y = 3
  sphere.position.x = 3

  
  
  //Plane
  const planeGeometry = new THREE.PlaneGeometry(5,5,64,64)
  const planeMaterial = new THREE.MeshStandardMaterial({
    map:texture,
    displacementMap:height,
  })
  const plane = new THREE.Mesh(planeGeometry,planeMaterial)
  scene.add(plane)
  plane.rotation.x = -0.5*Math.PI 




  //Animerer scenen
  function animate(time) {

    sphere.rotation.x = time/1000
    sphere.rotation.y = time/1000

    renderer.render(scene,camera)
  }

  renderer.setSize(window.innerWidth,window.innerHeight)
  renderer.setAnimationLoop(animate)
}
