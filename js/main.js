import {
    PerspectiveCamera,
    WebGLRenderer,
    PCFSoftShadowMap,
    Scene,
    Mesh,
    Clock,
    AnimationMixer,
    TextureLoader,
    MeshBasicMaterial,
    RepeatWrapping,
    DirectionalLight,
    Vector3,
    Vector2,
    AxesHelper,
    CubeGeometry,
    Fog,
    LOD,
    Matrix4,
} from './lib/three.module.js';

import {Wolf} from './Wolf.js'

import Utilities from './lib/Utilities.js';
import MouseLookController from './controls/MouseLookController.js';

import TextureSplattingMaterial from './materials/TextureSplattingMaterial.js';
import TerrainBufferGeometry from './terrain/TerrainBufferGeometry.js';
import { GLTFLoader } from './loaders/GLTFLoader.js';
import { SimplexNoise } from './lib/SimplexNoise.js';

let man = null;

const move = {
    forward: false,
    backward: false,
    left: false,
    right: false,
    speed: 0.1, // Adjust movement speed
};

let loaderMan = null;

async function main() {

    const scene = new Scene();

    //Legger til tåke
    scene.fog = new Fog( 0x0b0d15, 5, 20)

    const axesHelper = new AxesHelper(15);
    scene.add(axesHelper);

    const camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

    const renderer = new WebGLRenderer({ antialias: true });
    renderer.setClearColor('#FFFFF')
    renderer.setSize(window.innerWidth, window.innerHeight);

    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = PCFSoftShadowMap;

    //Eventlisteners for bevegelse
    window.addEventListener('keydown', (e) => {
        if (e.code === 'KeyW') move.forward = true;
        if (e.code === 'KeyS') move.backward = true;
        if (e.code === 'KeyA') move.left = true;
        if (e.code === 'KeyD') move.right = true;
    });

    window.addEventListener('keyup', (e) => {
        if (e.code === 'KeyW') move.forward = false;
        if (e.code === 'KeyS') move.backward = false;
        if (e.code === 'KeyA') move.left = false;
        if (e.code === 'KeyD') move.right = false;
    });
    let isDragging = false;
    window.addEventListener('mousedown', (e) => {isDragging = true});
    window.addEventListener('mouseup', (e) => {isDragging = false});
    window.addEventListener('mousemove', (event) => {
        if (isDragging) {
            const sensitivity = 0.005;
            cameraRotation.x -= event.movementX * sensitivity;
            cameraRotation.y -= event.movementY * sensitivity;

            cameraRotation.y = Math.max(-Math.PI / 4, Math.min(Math.PI / 4, cameraRotation.y));
        }
    });


    /**
     * Handle window resize:
     *  - update aspect ratio.
     *  - update projection matrix
     *  - update renderer size
     */


    let mixerMan;
    let animations = [];
    //Bussinessman
    loaderMan = new GLTFLoader();
    loaderMan.load('resources/models/business_man_-_low_polygon_game_character.glb',
        (gltf) => {
            man = gltf.scene;
            animations = gltf.animations;
            man.position.set(10, 5, 10);
            man.scale.set(1.5, 1.5, 1.5);
            mixerMan = new AnimationMixer(man);
            console.log(gltf.animations);
            if (animations.length > 0) {
                const idleAction = mixerMan.clipAction(animations[0]);
                idleAction.play();
            }
            man.traverse((child) => {
                if (child.isMesh){
                    child.castShadow = true;
                    child.recieveShadow = true;
                }
            });
            scene.add(man);
        },
        (xhr) => {
            console.log('Man model: ${(xhr.loaded / xhr.total) * 100}% loaded');
        },
        (error) => {
            console.error('Error loading model', error);
        });



  
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();

        renderer.setSize(window.innerWidth, window.innerHeight);
    }, false);

    /**
     * Add canvas element to DOM.
     */
    document.body.appendChild(renderer.domElement);

    /**
     * Add light
     */
    const directionalLight = new DirectionalLight(0x4a4a4a, 1);
    directionalLight.position.set(300, 400, 0);

    directionalLight.castShadow = true;

    //Set up shadow properties for the light
    directionalLight.shadow.mapSize.width = 512;
    directionalLight.shadow.mapSize.height = 512;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 2000;

    scene.add(directionalLight);

    // Set direction
    directionalLight.target.position.set(0, 15, 0);
    scene.add(directionalLight.target);

    camera.position.z = 70;
    camera.position.y = 55;
    camera.rotation.x -= Math.PI * 0.25;


    /**
     * Add terrain:
     * 
     * We have to wait for the image file to be loaded by the browser.
     * There are many ways to handle asynchronous flow in your application.
     * We are using the async/await language constructs of Javascript:
     *  - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function
     */
    const heightmapImage = await Utilities.loadImage('resources/images/heightmap.png');
    const width = 100;

    const simplex = new SimplexNoise();
    const terrainGeometry = new TerrainBufferGeometry({
        width,
        heightmapImage,
        // noiseFn: simplex.noise.bind(simplex),
        numberOfSubdivisions: 128,
        height: 20
    });

    const grassTexture = new TextureLoader().load('resources/textures/grass_02.png');
    grassTexture.wrapS = RepeatWrapping;
    grassTexture.wrapT = RepeatWrapping;
    grassTexture.repeat.set(5000 / width, 5000 / width);

    const snowyRockTexture = new TextureLoader().load('resources/textures/snowy_rock_01.png');
    snowyRockTexture.wrapS = RepeatWrapping;
    snowyRockTexture.wrapT = RepeatWrapping;
    snowyRockTexture.repeat.set(1500 / width, 1500 / width);

  const waterTexture = new TextureLoader().load('resources/textures/water.jpg')
    
  const waterMaterial = new MeshBasicMaterial({
    map: waterTexture
  }) 
  const waterGeometry = new CubeGeometry(100,100,10,10)

  const water = new Mesh(waterGeometry,waterMaterial)
  scene.add(water)

  water.rotation.x = -0.5*Math.PI
  water.position.y = -1 

 


    const splatMap = new TextureLoader().load('resources/images/splatmap_01.png');

    const terrainMaterial = new TextureSplattingMaterial({
        color: 0xffffff,
        shininess: 0,
        textures: [snowyRockTexture, grassTexture],
        splatMaps: [splatMap]
    });

    const terrain = new Mesh(terrainGeometry, terrainMaterial);

    terrain.castShadow = true;
    terrain.receiveShadow = true;

    scene.add(terrain);
    // instantiate a GLTFLoader:
    const loader = new GLTFLoader();
    const wolves = []
    let numWolves = 30;



    const bounds = { minX: -49, maxX: 49, minZ: -49, maxZ: 49 }; // Terrain boundaries


    // Create multiple wolves
    for (let i = 0; i < numWolves; i++) {
      const initialX = Math.random() * (bounds.maxX - bounds.minX) + bounds.minX;
      const initialZ = Math.random() * (bounds.maxZ - bounds.minZ) + bounds.minZ;
      const initialPosition = new Vector3(initialX, 10, initialZ);

      const wolf = new Wolf(loader, scene, initialPosition, terrainGeometry, bounds);
     wolves.push(wolf);
    }

    /**
     * Add trees
     */

    const trees = [];

// Last inn tre-modellen én gang
    loader.load(
        'resources/models/kenney_nature_kit/tree_thin.glb',
        (object) => {
            // Lagre de teksturerte og uteksturerte versjonene av treet for gjenbruk
            const highDetailTree = object.scene.children[0].clone();
            const lowDetailTree = object.scene.children[0].clone();

            // Konfigurer høy-detaljert tre (teksturert)
            highDetailTree.traverse((child) => {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            });

            // Konfigurer lav-detaljert tre (uten tekstur)
            lowDetailTree.traverse((child) => {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                    child.material = new MeshBasicMaterial({ color: 0x1e400b });
                }
            });

            // Plasser flere instanser av LOD-objektene i scenen
            for (let x = -50; x < 50; x += 3) {
                for (let z = -50; z < 50; z += 3) {

                    const px = x + 1 + (6 * Math.random()) - 3;
                    const pz = z + 1 + (6 * Math.random()) - 3;
                    const height = terrainGeometry.getHeightAt(px, pz);

                    if (height < 6.5 && height > 4) {
                        // Opprett LOD-objekt for treet
                        const treeLOD = new LOD();

                        // Legg til detaljnivåene til LOD-objektet
                        treeLOD.addLevel(highDetailTree.clone(), 10);   // Tekstur vises innenfor 10 enheter
                        treeLOD.addLevel(lowDetailTree.clone(), 15);    // Uten tekstur utenfor 15 enheter

                        // Sett posisjon og rotering for treet
                        treeLOD.position.set(px, height - 0.01, pz);
                        treeLOD.rotation.y = Math.random() * (2 * Math.PI);
                        treeLOD.scale.multiplyScalar(3 + Math.random() * 2);

                        // Plasser LOD-objektet i scenen
                        scene.add(treeLOD);


                        trees.push(treeLOD);
                    }

                }
            }
        },
        (xhr) => {
            console.log(((xhr.loaded / xhr.total) * 100) + '% loaded');
        },
        (error) => {
            console.error('Error loading model.', error);
        }
    );

    /**
     * Set up camera controller:
     */



    const mouseLookController = new MouseLookController(camera);

    // We attach a click lister to the canvas-element so that we can request a pointer lock.
    // https://developer.mozilla.org/en-US/docs/Web/API/Pointer_Lock_API
    const canvas = renderer.domElement;

    /**Pointerlock
    canvas.addEventListener('click', () => {
        canvas.requestPointerLock();
    });
    */

    /**let yaw = 0;
    let pitch = 0;
        */
    const mouseSensitivity = 0.001;

    /**
    function updateCamRotation(event) {
        yaw += event.movementX * mouseSensitivity;
        pitch += event.movementY * mouseSensitivity;
    }
        */

    /**
    document.addEventListener('pointerlockchange', () => {
        if (document.pointerLockElement === canvas) {
            canvas.addEventListener('mousemove', updateCamRotation, false);
        } else {
            canvas.removeEventListener('mousemove', updateCamRotation, false);
        }
    });
     */

    let move = {
        forward: false,
        backward: false,
        left: false,
        right: false,
        speed: 0.01
    };

    /**keydown
    window.addEventListener('keydown', (e) => {
        if (e.code === 'KeyW') {
            move.forward = true;
            e.preventDefault();
        } else if (e.code === 'KeyS') {
            move.backward = true;
            e.preventDefault();
        } else if (e.code === 'KeyA') {
            move.left = true;
            e.preventDefault();
        } else if (e.code === 'KeyD') {
            move.right = true;
            e.preventDefault();
        }
    });

    window.addEventListener('keyup', (e) => {
        if (e.code === 'KeyW') {
            move.forward = false;
            e.preventDefault();
        } else if (e.code === 'KeyS') {
            move.backward = false;
            e.preventDefault();
        } else if (e.code === 'KeyA') {
            move.left = false;
            e.preventDefault();
        } else if (e.code === 'KeyD') {
            move.right = false;
            e.preventDefault();
        }
    });

        */
    const velocity = new Vector3(0.0, 0.0, 0.0);
    const clock = new Clock();
  let mixer;

    let then = performance.now();
    let currentAction = null;
    function moveMan(deltaTime,loader) {

     mixer = new AnimationMixer(man)
        if (!man || animations.length === 0) return;
        const speed = 3;

        const moveDirection = new Vector3(0,0,0);
        let newAction = null;

        if (move.forward) {
            moveDirection.z -= 1;
            newAction = mixerMan.clipAction(animations[24]);
        }
        if (move.backward) {
            moveDirection.z += 1;
            newAction = mixerMan.clipAction(animations[24]);
        }
        if (move.left) {
            moveDirection.x -= 1;
            newAction = mixerMan.clipAction(animations[24]);
        }
        if (move.right) {
            moveDirection.x += 1;
            newAction = mixerMan.clipAction(animations[24]);
        }

        if (!move.right && !move.forward && !move.backward && !move.left) newAction = mixerMan.clipAction(animations[0]);

        if (currentAction !== newAction){
            if (currentAction) currentAction.fadeOut(0.2);
            newAction.reset().fadeIn(0.2).play();
            currentAction = newAction;
        }

        if(mixer) mixerMan.update(deltaTime);

        moveDirection.normalize().multiplyScalar(speed*deltaTime);


        //Legge til iht, kamera.
        const cameraDirectionMatrix = new Matrix4();
        cameraDirectionMatrix.extractRotation(camera.matrix);
        moveDirection.applyMatrix4(cameraDirectionMatrix);


        const newPosition = man.position.clone().add(moveDirection);

        newPosition.x = Math.min(Math.max(newPosition.x, bounds.minX), bounds.maxX);
        newPosition.z = Math.min(Math.max(newPosition.z, bounds.minZ), bounds.maxZ);

        const terrainHeight = terrainGeometry.getHeightAt(newPosition.x, newPosition.z);
        newPosition.y = terrainHeight;

        man.position.set(newPosition.x, newPosition.y, newPosition.z);

        if (moveDirection.length() > 0) {
            const angle = Math.atan2(moveDirection.x, moveDirection.z);
            man.rotation.y = angle;
        }


    }

    function checkCollision(pos1, pos2, size = 1){
        return (
            Math.abs(pos1.x-pos2.x) < size &&
            Math.abs(pos2.y-pos2.y) < size &&
            Math.abs(pos1.z-pos2.z) < size
        );

    }


    let cameraOffset = new Vector3(0,5,-3);
    let cameraRotation = new Vector2(0,0);
    function loop(now) {

        /**
        const delta = now - then;
        then = now;

        const moveSpeed = move.speed * delta;

        velocity.set(0.0, 0.0, 0.0);

        if (move.left) {
            velocity.x -= moveSpeed;
        }

        if (move.right) {
            velocity.x += moveSpeed;
        }

        if (move.forward) {
            velocity.z -= moveSpeed;
        }

        if (move.backward) {
            velocity.z += moveSpeed;
        }

        // update controller rotation.
        mouseLookController.update(pitch, yaw);
        yaw = 0;
        pitch = 0;
        */


        const delta = clock.getDelta();
        then = now;
        moveMan(delta, loaderMan);

        wolves.forEach((wolf ) => wolf.move(delta))
        if(man){

            wolves.forEach((wolf) => {
                if (wolf.model){
                    if (checkCollision(man.position, wolf.model.position)){
                        console.log("Du kolliderte med ulven!");
                    }
                }
            })

            const rotationMatrix = new Matrix4().makeRotationY(cameraRotation.x);
            const rotatedOffset = cameraOffset.clone().applyMatrix4(rotationMatrix);

            rotatedOffset.y += Math.sin(cameraRotation.y) * cameraOffset.length();

            const cameraPosition = man.position.clone().add(rotatedOffset);

            camera.position.lerp(cameraPosition, 0.1);

            const positionLook = man.position.clone();
            positionLook.y += 2.5;
            positionLook.x += 0;

            camera.lookAt(positionLook);
        }

          
        /** apply rotation to velocity vector, and translate moveNode with it.
        velocity.applyQuaternion(camera.quaternion);
        camera.position.add(velocity);
        */
        // render scene:
        renderer.render(scene, camera);

        requestAnimationFrame(loop);

    };

    loop(performance.now());

}

main(); // Start application


