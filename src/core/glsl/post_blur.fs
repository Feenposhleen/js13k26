#version 300 es
precision mediump float;
uniform float v;
uniform float t;
in vec2 vuv;
out vec4 fragColor;
uniform sampler2D ut;

const float or = 0.0015;
const vec2 ofs[4] = vec2[4](
    vec2(-or,-or),
    vec2(or,-or),
    vec2(or,or),
    vec2(-or,or)
);

void main(){
  vec3 base = texture(ut, vuv).rgb;
  vec3 col = vec3(.0,.0,.0);

  for (int i = 0; i < 4; ++i) {
    vec4 sc = texture(ut, vuv + (ofs[i] * v));
    col += sc.rgb;
  }

  // Combine
  col = col / 4.0;
  col = (base * .85) + (col * .15);

  // Output
  fragColor = vec4(col, 1.0);
}
