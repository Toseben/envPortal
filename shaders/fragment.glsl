#define PI 3.141592653589793

uniform vec3 elementPos;
uniform float ringSize;
uniform float click;
uniform float hoverTime;
uniform float currentTime;
uniform sampler2D textureEnv;
uniform sampler2D canvasTex;
varying vec3 vPos;
varying vec2 vUv;

#pragma glslify: range = require('glsl-range')
#pragma glslify: ease = require(glsl-easings/back-out)

vec2 convert(vec2 uv, vec2 origin) {
    float s = 1.0 / PI;
    float r = length(uv - origin);
    float theta = mod(atan(uv.y - origin.y, uv.x - origin.x) + PI / 2.0 + PI, 2.0 * PI) - PI;
    return vec2(s * theta, -r * 1.0) + origin;
}

vec2 calc(vec2 p, vec2 origin, float t) {
    vec2 q = convert(p, origin);
    vec2 uv = mix(p, q, t);
    return uv;
}

void main() {
    
    // Deform Amount
    float deform = 1.0 - click;
    //deform = 0.0;
    
    // Scale Up
    float xOffset = elementPos.x;
    float yOffset = elementPos.y * deform;
    vec2 scaledUV = vec2(vUv.x + xOffset, vUv.y + yOffset) * 2.0 - 1.0;
    scaledUV.x *= 2.0;
    vec2 ratio = vec2(scaledUV.x * 0.5, scaledUV.y);
    
    // Anim
    float hoverMult = ease(min(1.0, hoverTime)) + 1.0;
    
    // Create UVs
    float anim = ringSize * hoverMult;
    anim = mix(anim, 1.0, click);
    //anim = 1.0;
    float circle = anim - deform * dot(scaledUV, scaledUV);
    circle = sqrt(clamp(circle, 0.0, 1.0));
    vec2 sampleUV = ratio / circle;
    
    // Scale Down
    sampleUV = (sampleUV + 1.0) * 0.5;
    
    // Final Texture
    float alpha = range(0.0, 0.1, circle);
    vec3 tex = vec3(texture2D(textureEnv, sampleUV, 0.0));
    vec3 canvasTex = vec3(texture2D(canvasTex, vec2(1.0 - sampleUV.x, sampleUV.y), 0.0));
    tex = mix(tex, canvasTex, canvasTex.x * max(range(0.66, 1.0, deform), 0.0));
    gl_FragColor = vec4(tex, alpha);
    //gl_FragColor = vec4(vec3(1.0, 0.0, 0.0), circle);
    
}