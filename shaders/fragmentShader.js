const glsl = (t, defines) => t.raw[0] + defines + t.raw[1];


export default defines => glsl`#version 300 es

${defines}

varying float vAmount;

  void main{


  vec3 water = smoothstep(0.01, 0.99, vAmount) * vec3(0.0, 0.0, 1.0);

  
  gl_FragColor = vec4(water, 1.0);
}


`
