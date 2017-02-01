var clickTime;
var selected;

AFRAME.registerComponent('glsl_shader', {
    schema: {
        index: {type: 'string'},
        pos: {type: 'vec3'}
    },
    
    init: function () {
        
        // RENDER SETTINGS //
        var scene = document.querySelector('a-scene');
        scene.addEventListener('render-target-loaded', function () {
            scene.renderer.sortObjects = true;
            tRenderer = scene.renderer;
            tCamera = scene.camera;
            tScene = scene.object3D;
        });
        
        // INIT //
        clickTime = Date.now();
        var element = this.el;
        element.uniforms;
        var index = parseInt(this.data.index) + 1;
        var dPos = this.data.pos;
        var position = new THREE.Vector3(dPos.x, dPos.y, dPos.z).normalize();
        var ringSize = 0.25;
        var radius = 1, segments = 64, rings = 32;
        var geometry = new THREE.SphereBufferGeometry( radius, segments, rings ); 
        var mesh = this.el.getOrCreateObject3D('mesh', THREE.Mesh);
        mesh.geometry = geometry;
        mesh.renderOrder = 0;
        
        // SHADER //
        SHADER_LOADER.load(function (data) {
            var customVertexShader = data.custom.vertex;
            var customFragmentShader = data.custom.fragment
            var loader = new THREE.TextureLoader();
        
            element.uniforms = {
                elementPos: { value: position },
                rayPos: { value: new THREE.Vector3( 0, 0, 0 )},
                ringSize: { value: ringSize },
                click: { value: 1.0 },
                hoverTime: { value: 0.0 },
                textureEnv: { type: 't', value: loader.load( 'img/int_' + index + '.jpg' ) }
            };

            // RAYCASTER //
            var parent, p, clickThres;
            var animSwitch = 0;
            var animated = 0;
            var countUp = Date.now();
            var raycaster = document.getElementById("raycaster");
            raycaster.addEventListener('raycaster-intersection', function (evt) {
                parent = evt.detail.els[0].object3D;
                p = evt.detail.intersections[0].point;
                //element.uniforms.rayPos.value = p;
                
                if (p.distanceTo(element.uniforms.elementPos.value) < ringSize) {
                    if (animSwitch == 0) {
                        animSwitch = 1;
                        clickThres = ringSize * 2;
                        $({animValue: 0}).animate({animValue: 1}, {
                            duration: 200,
                            step: function() { 
                                element.uniforms.hoverTime.value = this.animValue;      
                            }
                        });
                        // A-FRAME VR VIEW - DELETE!
                        $({animValue: 0}).animate({animValue: 1}, {
                            duration: 1000,
                            complete: function() {
                                var mousedown = new Event('mousedown');
                                var mouseup = new Event('mouseup');
                                document.dispatchEvent(mousedown);
                                document.dispatchEvent(mouseup);
                            }
                        });
                    }
                } else if (p.distanceTo(element.uniforms.elementPos.value) > (ringSize * 2)) {
                    if (animSwitch == 1) {
                        animSwitch = 0;
                        clickThres = ringSize;
                        $({animValue: 1}).animate({animValue: 0}, {
                            duration: 200,
                            step: function() { 
                                element.uniforms.hoverTime.value = this.animValue;    
                            }
                        });
                    }
                }

            });
            
            // MOUSE CLICK //
            var longPress = 250; // Duration you consider a long press
            var startTime;

            $(document).on('mousedown', function(e) {
                startTime = new Date().getTime();
            });

            $(document).on('mouseup', function(e) {
                if (new Date().getTime() < (startTime + longPress)) {
                    expandCircle();
                }
            });

            function expandCircle() {
                
                // If clicked inside circle and circle not currently selected
                if (p.distanceTo(element.uniforms.elementPos.value) < clickThres && selected != index) {
                    // Reset animation of previously selected
                    var resetAnim = document.getElementById("circle_" + selected);
                    if (resetAnim != null) {
                        resetAnim.getObject3D('mesh').renderOrder = 1;
                    }
                    // Settings and animation
                    selected = index;
                    mesh.renderOrder = 2;
                    $({animValue: 1}).animate({animValue: 10}, {
                        duration: 750,
                        step: function() { 
                            element.uniforms.click.value = this.animValue;      
                        },
                        complete: function() {
                            animFinish();
                        }
                    });
                }
            };
            
            function newEnvPositions(idx) {
                switch(selected - 1) {
                        
                    case 0:
                        var envPos = {
                            1: { value: new THREE.Vector3( -1, 0, -1 ) },
                            2: { value: new THREE.Vector3( 0, 0, -1 ) },
                            3: { value: new THREE.Vector3( 1, 0, -1 ) }
                        }
                        return envPos[idx].value.normalize();
                        break;
                        
                    case 1:
                        var envPos = {
                            0: { value: new THREE.Vector3( 0, 1, -1 ) },
                            2: { value: new THREE.Vector3( 0, 0, -1 ) },
                            3: { value: new THREE.Vector3( 0, -1, -1 ) }
                        }
                        return envPos[idx].value.normalize();
                        break;
                        
                    case 2:
                        var envPos = {
                            0: { value: new THREE.Vector3( -1, -1, -1 ) },
                            1: { value: new THREE.Vector3( 0, 0, -1 ) },
                            3: { value: new THREE.Vector3( 1, 1, -1 ) }
                        }
                        return envPos[idx].value.normalize();
                        break;
                        
                    case 3:
                        var envPos = {
                            0: { value: new THREE.Vector3( -1, 1, -1 ) },
                            1: { value: new THREE.Vector3( 0, 0, -1 ) },
                            2: { value: new THREE.Vector3( 1, -1, -1 ) }
                        }
                        return envPos[idx].value.normalize();
                        break;
                }
            }
            
            // Post-Anim Reset of other circles
            function animFinish() {
                var allEnv = $('.env');
                var arrayLength = allEnv.length;
                for (var i = 0; i < arrayLength; i++) {
                    var envIndex = allEnv[i].id.split("_")[1];
                    if (envIndex != selected) {
                        allEnv[i].getObject3D('mesh').renderOrder = 1;
                        allEnv[i].uniforms.elementPos.value = newEnvPositions(i);
                    }
                }
                
                // Fade-in circles
                allEnv.splice(selected - 1, 1);
                $({animValue: 0}).animate({animValue: 1}, {
                    duration: 250,
                    step: function() { 
                        allEnv[0].uniforms.click.value = this.animValue;
                        allEnv[1].uniforms.click.value = this.animValue;
                        allEnv[2].uniforms.click.value = this.animValue;
                    }
                });
                
                mesh.renderOrder = 0;
            }

            // MATERIAL //
            mesh.material = new THREE.ShaderMaterial( {
                uniforms: element.uniforms,
                vertexShader: customVertexShader,
                fragmentShader: customFragmentShader,
                side: THREE.DoubleSide,
                transparent: true
            });
        });
    }
});