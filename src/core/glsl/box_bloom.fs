#version 300 es
precision mediump float;
uniform float v;
uniform float t;
in vec2 vuv;
out vec4 fragColor;
uniform sampler2D ut;

const float or = 0.002;
const vec2 ofs[4] = vec2[4](
    vec2(-or,-or),
    vec2(or,-or),
    vec2(or,or),
    vec2(-or,or)
);

void main(){
  vec3 base = texture(ut, vuv).rgb;
  float bright = 0.;

  for (int i = 0; i < 4; ++i) {
    vec4 sc = texture(ut, vuv + (ofs[i]));
    bright += length(sc.rgb);
  }

  bright = (bright / 4.) * v;

  // Combine
  vec3 col = base + (base * (bright * bright));

  // Output
  fragColor = vec4(col, 1.0);
}
