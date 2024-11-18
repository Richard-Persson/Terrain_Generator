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
} from './lib/three.module.js';

import Utilities from './lib/Utilities.js';
import MouseLookController from './controls/MouseLookController.js';

import TextureSplattingMaterial from './materials/TextureSplattingMaterial.js';
import TerrainBufferGeometry from './terrain/TerrainBufferGeometry.js';
import { GLTFLoader } from './loaders/GLTFLoader.js';
import { SimplexNoise } from './lib/SimplexNoise.js';

async function main() {

    const scene = new Scene();

    const axesHelper = new AxesHelper(15);
    scene.add(axesHelper);

    const camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

    const renderer = new WebGLRenderer({ antialias: true });
    renderer.setClearColor('#96c9d7')
    renderer.setSize(window.innerWidth, window.innerHeight);

    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = PCFSoftShadowMap;

    /**
     * Handle window resize:
     *  - update aspect ratio.
     *  - update projection matrix
     *  - update renderer size
     */
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
    const directionalLight = new DirectionalLight(0xffffff);
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

    /**
     * Add trees
     */

    // instantiate a GLTFLoader:
    const loader = new GLTFLoader();
    let mixer;
    let wolf = null;
    let wolf_Position = new Vector3(0, 10, 4);
    const bounds = { minX: -49, maxX: 49, minZ: -49, maxZ: 49 }; // Terrain boundaries
    let direction = new Vector2(1, 0); // Initial direction (2D vector for X and Z)
    loader.load('resources/models/wolf.glb',
    (object)=>{


      wolf = object.scene
      wolf.position.set(wolf_Position.x,wolf_Position.y,wolf_Position.z)
      
      mixer = new AnimationMixer(wolf)
      mixer.clipAction(object.animations[0]).play();

      scene.add(wolf)


    })

  function changeDirection() {
    const angle = Math.random() * Math.PI * 2; 
    direction.set(Math.cos(angle), Math.sin(angle));
  }

  function moveWolf(deltaTime){
    if(!wolf) return
    const speed = 8; 

      wolf_Position.x += direction.x * speed * deltaTime;
      wolf_Position.z += direction.y * speed * deltaTime;

    if (wolf_Position.x < bounds.minX || wolf_Position.x > bounds.maxX) {
      direction.x = -direction.x; 
      wolf_Position.x = Math.min(Math.max(wolf_Position.x, bounds.minX), bounds.maxX);
      changeDirection();
    }
    if (wolf_Position.z < bounds.minZ || wolf_Position.z > bounds.maxZ) {
      direction.y = -direction.y;
      wolf_Position.z = Math.min(Math.max(wolf_Position.z, bounds.minZ), bounds.maxZ);
      changeDirection(); 
    }

    //Endrer posisjon ifht vann
    if (wolf_Position.y < 4 ) {
      direction.y = -direction.j;
      wolf_Position.z = Math.min(Math.max(wolf_Position.z, bounds.minZ), bounds.maxZ);
      changeDirection(); 
    }

     const terrainHeight = terrainGeometry.getHeightAt(wolf_Position.x, wolf_Position.z);
     wolf_Position.y = terrainHeight; 

     wolf.position.set(wolf_Position.x, wolf_Position.y, wolf_Position.z); // Update the wolf's position

     const angle = Math.atan2(direction.x, direction.y); 
     wolf.rotation.y = angle; 

    if (mixer) mixer.update(deltaTime);

    //Bytte retning av og til
    if (Math.random() < 0.01) {
      changeDirection()
    }

  }

    loader.load(
        // resource URL
        'resources/models/kenney_nature_kit/tree_thin.glb',
        // called when resource is loaded
        (object) => {
            for (let x = -50; x < 50; x += 4) {
                for (let z = -50; z < 50; z += 4) {
                    
                    const px = x + 1 + (6 * Math.random()) - 3;
                    const pz = z + 1 + (6 * Math.random()) - 3;

                    const height = terrainGeometry.getHeightAt(px, pz);

                    if (height < 6 && height > 4) {
                        const tree = object.scene.children[0].clone();

                        tree.traverse((child) => {
                            if (child.isMesh) {
                                child.castShadow = true;
                                child.receiveShadow = true;
                            }
                        });
                        
                        tree.position.x = px;
                        tree.position.y = height - 0.01;
                        tree.position.z = pz;

                        tree.rotation.y = Math.random() * (2 * Math.PI);

                        tree.scale.multiplyScalar(1.5 + Math.random() * 1);

                        scene.add(tree);
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

    canvas.addEventListener('click', () => {
        canvas.requestPointerLock();
    });

    let yaw = 0;
    let pitch = 0;
    const mouseSensitivity = 0.001;

    function updateCamRotation(event) {
        yaw += event.movementX * mouseSensitivity;
        pitch += event.movementY * mouseSensitivity;
    }

    document.addEventListener('pointerlockchange', () => {
        if (document.pointerLockElement === canvas) {
            canvas.addEventListener('mousemove', updateCamRotation, false);
        } else {
            canvas.removeEventListener('mousemove', updateCamRotation, false);
        }
    });

    let move = {
        forward: false,
        backward: false,
        left: false,
        right: false,
        speed: 0.01
    };

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

    const velocity = new Vector3(0.0, 0.0, 0.0);
    const clock = new Clock();

    let then = performance.now();
    function loop(now) {

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

        //Update animations
        if(mixer)mixer.update(0.002)
        moveWolf(clock.getDelta())
          
        // apply rotation to velocity vector, and translate moveNode with it.
        velocity.applyQuaternion(camera.quaternion);
        camera.position.add(velocity);

        // render scene:
        renderer.render(scene, camera);

        requestAnimationFrame(loop);

    };

    loop(performance.now());

}

main(); // Start application
