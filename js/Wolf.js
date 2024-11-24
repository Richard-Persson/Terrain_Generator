import {
  Vector2,
  AnimationMixer,
} from './lib/three.module.js';




export class Wolf{


  //Tar inn en loader, scene, startposisjon, terrenggemoetriet, og begrensninger
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

      //endrer størrelse
      this.model.scale.set(1.7, 1.7, 1.7);

      scene.add(this.model);

    })



  }
  //Henter høyden på terrenget
  getTerrainHeight(x, z) {
    return this.terrainGeometry.getHeightAt(x, z);
  }

  //Endrer retning på ulven
  changeDirection() {
    const angle = Math.random() * Math.PI * 2; 
    this.direction.set(Math.cos(angle), Math.sin(angle)); 
  }



  move(deltaTime) {

    //Hvis modellen ikke er lastet inn returner ingenting
    if (!this.model) return; 

    const speed = 5;


    //Hastigheten i x og y retning
    this.position.x += this.direction.x * speed * deltaTime;
    this.position.z += this.direction.y * speed * deltaTime;



    //Henter inn høyden på terrenget sånn at ulven ikke faser igjennom eller flyter over
    const terrainHeight = this.getTerrainHeight(this.position.x, this.position.z);
    this.position.y = terrainHeight;

    //Hvis ulven nærmer seg vann høyde snu retningen
    const waterHeight = 4;
    if (this.position.y <= waterHeight) {
      this.direction.multiplyScalar(-1); 
      this.position.y = terrainHeight; 
    }



    //Hvis ulven prøver å gå forbi x aksen sine begrensninger: snu retning
    if (this.position.x < this.bounds.minX || this.position.x> this.bounds.maxX) {
      this.direction.x = -this.direction.x
      this.position.x = Math.min(Math.max(this.position.x,this.bounds.minX),this.bounds.maxX)

    }

    //Hvis ulven prøver å gå forbi z aksen sine begrensninger: snu retning
    if (this.position.z < this.bounds.minZ || this.position.z> this.bounds.maxZ) {
      this.direction.z = -this.direction.z
      this.position.z = Math.min(Math.max(this.position.z,this.bounds.minZ),this.bounds.maxZ)

    }

    //Tilfeldig endring av posisjon av og til
    this.changeTimer += deltaTime;
    if (this.changeTimer > this.changeInterval) {
      this.changeTimer = 0;
      this.changeInterval = Math.random() * 5 + 2; 
      this.changeDirection();
    }


    //setter posisjonen til ulven
    this.model.position.set(this.position.x, this.position.y, this.position.z);


    //Roterer ulven iht høyden
    const angle = Math.atan2(this.direction.x, this.direction.y);
    this.model.rotation.y = angle;


    //Oppdaterer animasjon
    if (this.mixer) this.mixer.update(deltaTime);
  }
}
