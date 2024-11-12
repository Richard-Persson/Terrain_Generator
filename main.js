import * as THREE from 'three'


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
  const axesHelper = new THREE.AxesHelper()
  scene.add(axesHelper)
renderer.setSize(window.innerWidth,window.innerHeight)
renderer.render(scene,camera)
}
