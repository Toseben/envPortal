var clickTime;
var selected;

AFRAME.registerComponent('glsl_shader', {
    schema: {
        index: {type: 'string'},
        pos: {type: 'vec2'}
    },
    
    init: function () {
        
        // INIT //
        clickTime = Date.now();
        var element = this.el;
        var index = parseInt(this.data.index) + 1;
        var dPos = this.data.pos;
        var position = new THREE.Vector2(dPos.x, dPos.y);
        var ringSize = 0.015;
        var radius = 1, segments = 64, rings = 32;
        //var geometry = new THREE.SphereBufferGeometry( radius, segments, rings );
        var geometry = new THREE.PlaneBufferGeometry( 1, 0.5, 1, 1 );
        var mesh = this.el.getOrCreateObject3D('mesh', THREE.Mesh);
        mesh.geometry = geometry;
        mesh.renderOrder = 0;
        
        // RENDER SETTINGS //
        var scene = document.querySelector('a-scene');
        scene.addEventListener('render-target-loaded', function () {
            scene.renderer.sortObjects = true;
            tRenderer = scene.renderer;
            tCamera = scene.camera;
            tScene = scene.object3D;
        });
        
        // SHADER //
        SHADER_LOADER.load(function (data) {
            var customVertexShader = data.custom.vertex;
            var customFragmentShader = data.custom.fragment
            var loader = new THREE.TextureLoader();
            var texture = loader.load( 'img/int_' + index + '.jpg' );
            texture.wrapS = THREE.RepeatWrapping;
            texture.wrapT = THREE.ClampToEdgeWrapping;
            
            element.uniforms = {
                elementPos: { value: position },
                rayPos: { value: new THREE.Vector3( 0, 0, 0 )},
                ringSize: { value: ringSize },
                click: { value: 0.0 },
                hoverTime: { value: 0.0 },
                textureEnv: { type: 't', value: texture },
                currentTime: { value: 0.0 }, 
                distance: { value: new THREE.Vector2(0.5, 0.5).sub(position) }
            };
            
            // RAYCASTER //
            var parent, p, clickThres;
            var animSwitch = 0;
            var animated = 0;
            var countUp = Date.now();
            var raycaster = document.getElementById("raycaster");
            raycaster.addEventListener('raycaster-intersection', function (evt) {
                parent = evt.detail.els[index - 1].object3D;
                p = evt.detail.intersections[index - 1].point;
                uv = evt.detail.intersections[index - 1].uv;
                uv.y = uv.y * 0.5 + 0.25;
                
                if (uv.distanceTo(element.uniforms.distance.value) < Math.sqrt(ringSize) * 0.25) {
                    if (animSwitch == 0) {
                        animSwitch = 1;
                        clickThres = Math.sqrt(ringSize * 2) * 0.25;
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
                                if (animSwitch == 1) {
                                    console.log("Gaze Click!")
                                    var mousedown = new Event('mousedown');
                                    var mouseup = new Event('mouseup');
                                    document.dispatchEvent(mousedown);
                                    document.dispatchEvent(mouseup);
                                }
                            }
                        });
                    }
                } else if (uv.distanceTo(element.uniforms.distance.value) > Math.sqrt(ringSize * 2) * 0.25) {
                    if (animSwitch == 1) {
                        animSwitch = 0;
                        clickThres = Math.sqrt(ringSize) * 0.25;
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
            var left  = 0,
                top   = 0;  

            $(document).on('mousedown', function(e) {
                left = e.pageX;
                top = e.pageY;
            });

            $(document).on('mouseup', function(e) {
                if (left == e.pageX && top == e.pageY) {
                    //console.log("Mouse Click!")
                    expandCircle();
                }
            });

            function expandCircle() {
                
                // If clicked inside circle and circle not currently selected
                if (uv.distanceTo(element.uniforms.distance.value) < clickThres && selected != index) {
                    // Reset animation of previously selected
                    var resetAnim = document.getElementById("circle_" + selected);
                    if (resetAnim != null) {
                        resetAnim.getObject3D('mesh').renderOrder = 1;
                    }
                    // Settings and animation
                    selected = index;
                    mesh.renderOrder = 2;
                    $({animValue: 0}).animate({animValue: 1}, {
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
                            1: { value: new THREE.Vector2( -0.1, 0.0 ) },
                            2: { value: new THREE.Vector2( 0.0, 0.0 ) },
                            3: { value: new THREE.Vector2( 0.1, 0.0 ) }
                        }
                        return envPos[idx].value;
                        break;
                        
                    case 1:
                        var envPos = {
                            0: { value: new THREE.Vector2( -0.1, 0.0 ) },
                            2: { value: new THREE.Vector2( 0.0, 0.0 ) },
                            3: { value: new THREE.Vector2( 0.1, 0.0 ) }
                        }
                        return envPos[idx].value;
                        break;
                        
                    case 2:
                        var envPos = {
                            0: { value: new THREE.Vector2( -0.1, 0.0 ) },
                            1: { value: new THREE.Vector2( 0.0, 0.0 ) },
                            3: { value: new THREE.Vector2( 0.1, 0.0 ) }
                        }
                        return envPos[idx].value;
                        break;
                        
                    case 3:
                        var envPos = {
                            0: { value: new THREE.Vector2( -0.1, 0.0 ) },
                            1: { value: new THREE.Vector2( 0.0, 0.0 ) },
                            2: { value: new THREE.Vector2( 0.1, 0.0 ) }
                        }
                        return envPos[idx].value;
                        break;
                }
            }
            
            // Post-Anim Reset of other circles
            var distance = new THREE.Vector2(0.5, 0.5);
            function animFinish() {
                var allEnv = $('.env');
                var arrayLength = allEnv.length;
                for (var i = 0; i < arrayLength; i++) {
                    var envIndex = allEnv[i].id.split("_")[1];
                    if (envIndex != selected) {
                        allEnv[i].getObject3D('mesh').renderOrder = 1;
                        allEnv[i].uniforms.click.value = 0;
                        //console.log(newEnvPositions(i));
                        //allEnv[i].uniforms.elementPos.value = newEnvPositions(i);
                        //console.log(distance.sub(newEnvPositions(i)));
                        //allEnv[i].uniforms.distance.value = distance.sub(newEnvPositions(i));
                    }
                }
                
                // Fade-in circles
                allEnv.splice(selected - 1, 1);
                $({animValue: 0}).animate({animValue: ringSize}, {
                    duration: 250,
                    step: function() { 
                        allEnv[0].uniforms.ringSize.value = this.animValue;
                        allEnv[1].uniforms.ringSize.value = this.animValue;
                        allEnv[2].uniforms.ringSize.value = this.animValue;
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