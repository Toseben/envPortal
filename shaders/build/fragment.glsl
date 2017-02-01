#define GLSLIFY 1
uniform vec3 elementPos;
uniform float ringSize;
uniform float click;
uniform float hoverTime;
uniform sampler2D textureEnv;
varying vec3 vPos;
varying vec2 vUv;

float range(float vmin, float vmax, float value) {
  return (value - vmin) / (vmax - vmin);
}

vec2 range(vec2 vmin, vec2 vmax, vec2 value) {
  return (value - vmin) / (vmax - vmin);
}

vec3 range(vec3 vmin, vec3 vmax, vec3 value) {
  return (value - vmin) / (vmax - vmin);
}

vec4 range(vec4 vmin, vec4 vmax, vec4 value) {
  return (value - vmin) / (vmax - vmin);
}

#ifndef PI
#define PI 3.141592653589793
#endif

float backOut(float t) {
  float f = 1.0 - t;
  return 1.0 - (pow(f, 3.0) - f * sin(f * PI));
}

void main() {
    
    vec2 uvMod = vUv;
    
    float size = ringSize;
    
    float hoverMult = backOut(min(1.0, hoverTime)) + 1.0;
    size *= hoverMult * click;

    float falloff = min(distance(elementPos, vPos) / size, 1.0);
    float blend = clamp(range(0.95, 1.0, falloff), 0.0, 1.0);
    gl_FragColor = mix(texture2D(textureEnv, uvMod), vec4(vec3(0.75), 0.0), blend);
    
    if (falloff > 0.975 && falloff < 1.0) {
        gl_FragColor = vec4(vec3(0.9, 0.49, 0.13), 1.0);
    }
    
}