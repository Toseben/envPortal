uniform vec3 elementPos;
uniform float ringSize;
uniform float click;
uniform float hoverTime;
uniform sampler2D textureEnv;
varying vec3 vPos;
varying vec2 vUv;

#pragma glslify: range = require('glsl-range')
#pragma glslify: ease = require(glsl-easings/back-out)

void main() {
    
    vec2 uvMod = vUv;
    
    float size = ringSize;
    
    float hoverMult = ease(min(1.0, hoverTime)) + 1.0;
    size *= hoverMult * click;

    float falloff = min(distance(elementPos, vPos) / size, 1.0);
    float blend = clamp(range(0.95, 1.0, falloff), 0.0, 1.0);
    gl_FragColor = mix(texture2D(textureEnv, uvMod), vec4(vec3(0.75), 0.0), blend);
    
    if (falloff > 0.975 && falloff < 1.0) {
        gl_FragColor = vec4(vec3(0.9, 0.49, 0.13), 1.0);
    }
    
}