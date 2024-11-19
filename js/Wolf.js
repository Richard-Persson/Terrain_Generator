import {
  Vector2,
  AnimationMixer,
} from './lib/three.module.js';




export class Wolf{


  constructor(loader, scene, initialPosition, terrainGeometry, bounds){

    this.model = null;
    this.mixer = null; 
    this.position = initialPosition.clone(); 
    this.direction = new Vector2(Math.random() - 0.5, Math.random() - 0.5).normalize(); 
    this.changeTimer = 0;
    this.changeInterval = Math.random() * 5 + 2; 
    this.bounds = bounds; 
    this.terrainGeometry = terrainGeometry; 

    loader.load('resources/models/wolf.glb', (object) => {
      this.model = object.scene;
      this.model.position.set(this.position.x, this.position.y, this.position.z);

      this.mixer = new AnimationMixer(this.model);
      this.mixer.clipAction(object.animations[0]).play();

      scene.add(this.model);

    })



  }
  getTerrainHeight(x, z) {
    return this.terrainGeometry.getHeightAt(x, z);
  }

  changeDirection() {
    const angle = Math.random() * Math.PI * 2; 
    this.direction.set(Math.cos(angle), Math.sin(angle)); 
  }



  move(deltaTime) {
    if (!this.model) return; 

    const speed = 5;

    
    this.position.x += this.direction.x * speed * deltaTime;
    this.position.z += this.direction.y * speed * deltaTime;



    // Get current terrain height
    const terrainHeight = this.getTerrainHeight(this.position.x, this.position.z);
    this.position.y = terrainHeight;

    // Water check: Reverse direction if touching water
    const waterHeight = 4;
    if (this.position.y <= waterHeight) {
      this.direction.multiplyScalar(-1); // Reverse direction
      this.position.y = terrainHeight; // Prevent sinking further
    }


    
    if (this.position.x < this.bounds.minX || this.position.x> this.bounds.maxX) {
      this.direction.x = -this.direction.x
      this.position.x = Math.min(Math.max(this.position.x,this.bounds.minX),this.bounds.maxX)
 
    }
    
    if (this.position.z < this.bounds.minZ || this.position.z> this.bounds.maxZ) {
      this.direction.z = -this.direction.z
      this.position.z = Math.min(Math.max(this.position.z,this.bounds.minZ),this.bounds.maxZ)
 
    }
 
    this.changeTimer += deltaTime;
    if (this.changeTimer > this.changeInterval) {
      this.changeTimer = 0;
      this.changeInterval = Math.random() * 5 + 2; 
      this.changeDirection();
    }

        
    this.model.position.set(this.position.x, this.position.y, this.position.z);

    
    const angle = Math.atan2(this.direction.x, this.direction.y);
    this.model.rotation.y = angle;

    
    if (this.mixer) this.mixer.update(deltaTime);
  }
}
