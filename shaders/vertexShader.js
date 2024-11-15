
const glsl = (t, defines) => t.raw[0] + defines + t.raw[1];

export default defines => glsl`#version 300 es

${defines}


uniform sampler2D bumpTexture;
uniform float bumpScale;




varying float vAmount;
void main{

  vec4 bumpData = texture2D(bumpTexture, uv);
  vAmount = bumdata.r;
  vec3 newPosition = position+normal*bumpScale*vAmount;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);

}

` 
