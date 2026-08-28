#version 300 es
precision mediump float;
uniform float v;
uniform float t;
in vec2 vUV;
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
  vec3 base = texture(ut, vUV).rgb;
  vec3 col = vec3(.0,.0,.0);

  for (int i = 0; i < 4; ++i) {
    vec4 sc = texture(ut, vUV + (ofs[i]));
    col += sc.rgb;
  }

  col = col / 4.;

  // Combine
  col = max(base, col * 1.4 * v);

  // Output
  fragColor = vec4(col, 1.0);
}
