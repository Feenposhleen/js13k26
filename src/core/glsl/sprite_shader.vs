#version 300 es

vec2 POS[4]=vec2[4](vec2(-1.0,-1.0),vec2(1.0,-1.0),vec2(-1.0,1.0),vec2(1.0,1.0));
vec2 UVS[4]=vec2[4](vec2(0.0,0.0),vec2(1.0,0.0),vec2(0.0,1.0),vec2(1.0,1.0));
in mat3 at;
in float al;
in float ao;
out vec2 vuv;
out float vo;
flat out int vl;

void main(){
  vec3 p = at * vec3(POS[gl_VertexID], 1.0);
  gl_Position = vec4(p.xy, 0.0, 1.0);
  vuv = UVS[gl_VertexID];
  vl = int(al + 0.2);
  vo = ao;
}
