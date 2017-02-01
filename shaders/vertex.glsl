varying vec3 vPos;
varying vec2 vUv;

void main() {

    vUv = uv;
    vPos = position;
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

}