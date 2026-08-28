#version 300 es

precision mediump float;
in vec2 vuv;
in float vo;
flat in int vl;
uniform highp sampler2DArray uta;
out vec4 outColor;

void main(){
  vec4 col = texture(uta, vec3(vuv, float(vl)));
  if (col.a < 0.9) discard;
  //col.rgb *= vo;
  col.a *= vo;
  outColor = col;
}
