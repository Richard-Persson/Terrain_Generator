import * as THREE from 'three'
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls'


window.onload = function init(){

  //Trenger disse for at THREEJS skal kjøre
  const renderer = new THREE.WebGLRenderer()
  document.body.appendChild(renderer.domElement)



  //Lager scenen
  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth/window.innerHeight,
    0.1,
    100,
  )

  //Setter posisjonen
  camera.position.set(0,2,5)

  //Lager akse og grid for hjelp
  const gridHelper = new THREE.GridHelper()
  scene.add(gridHelper)
  const axesHelper = new THREE.AxesHelper(5)
  scene.add(axesHelper)

  //Lager OrbitControls
  const orbit = new OrbitControls(camera,renderer.domElement) 
  scene.add(orbit)

  //Cube
  const boxGeometry = new THREE.BoxGeometry()
  const boxMaterial = new THREE.MeshBasicMaterial({color:0xFFFF})
  const box = new THREE.Mesh(boxGeometry,boxMaterial)
  scene.add(box)


  //Animerer scenen
  function animate(time) {

    box.rotation.x = time/1000
    box.rotation.y= time/1000

    renderer.render(scene,camera)
  }

  renderer.setSize(window.innerWidth,window.innerHeight)
  renderer.setAnimationLoop(animate)
}
