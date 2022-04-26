import React, {useState, useEffect} from "react";
import * as THREE from 'three'
// @ts-ignore
import WebGL from '../utils/WebGL.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { PointLightHelper } from "three";

/**
 * 
 * @returns The Main scene of the demonstration.
 */
export const MainScene = () => {
    const [loading, setLoading] = useState<boolean>(true) // Ready state of the component
    const [error, setError] = useState<String>()
    let lastScrollTop = 0;

    const loadComponent = () => new Promise((resolve, reject) => {
        if ( WebGL.isWebGLAvailable() ) {
            //Allow the app to load
            resolve('success')
        
        }
        else {
            const warning = WebGL.getWebGLErrorMessage();

            setError(warning)
            reject(warning)
        }
    })

    const buildScene = () => {
        var scene = new THREE.Scene();
        var camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );
        const cameraStartCoords = {
            x: 0,
            y: 0,
            z: 30
        }

        const mainSceneDiv = document.getElementById("main-scene");
        if (mainSceneDiv !== null) {
            var renderer = new THREE.WebGLRenderer({
                canvas: mainSceneDiv,
                antialias: true
            });
            renderer.setPixelRatio( window.devicePixelRatio )
            renderer.setSize( window.innerWidth, window.innerHeight );

            // camera.position.z = 5;
            camera.position.set( cameraStartCoords.x, cameraStartCoords.y, cameraStartCoords.z );
            camera.lookAt( 0, 0, 0 );

            //Add background image
            const spaceTexture = new THREE.TextureLoader().load('/space_bg.jpg')
            scene.background = spaceTexture

            // Add objects
            const ring = buildRing()
            scene.add( ring );
            const cube = buildCube();
            scene.add( cube );
            
            let starCount = 0;
            while (starCount < 300) {
                const newStar = buildStar()
                scene.add(newStar)
                starCount++
            }

            const earth = buildEarth()
            scene.add(earth)

            const asteroid = buildAsteroid()
            scene.add(asteroid)

            // Add light sources
            const pointLight = new THREE.PointLight(0Xffffff)
            pointLight.position.set(5, 5, 5)
            const ambientLight = new THREE.AmbientLight(0Xffffff)
            scene.add( pointLight )
            scene.add( ambientLight )

            // Add controls
            // const controls = new OrbitControls(camera, renderer.domElement)
            document.body.onscroll = function() {
                const top = document.body.getBoundingClientRect().top;
                
                // camera.position.z = top * -0.02
                if (camera.position.x >= asteroid.position.x && camera.position.x <= asteroid.position.x + 30) {
                    
                    const checkIsCloseToCenter = () => {
                        var threshold = 0.2;
                        
                        var positionScreenSpace = asteroid.position.clone().project(camera);
                        positionScreenSpace.setZ(0);
                        
                        var _isCloseToCenter = positionScreenSpace.length() < threshold;
                        return _isCloseToCenter;
                    }
                    
                    let isCloseToCenter = checkIsCloseToCenter()
                    if (!isCloseToCenter) {
                        camera.rotateY(-Math.PI / 360)
                        isCloseToCenter = checkIsCloseToCenter()
                    }
                    else {
                        camera.rotateY(Math.PI / 360)
                        isCloseToCenter = checkIsCloseToCenter()
                    }
                }
                else {
                    camera.lookAt(0,0,0)
                }
                camera.position.x = top * -0.2
                camera.position.y = top * -0.02
            }

            // Add helpers
            const gridHelper = new THREE.GridHelper(1000, 100, new THREE.Color("red"), new THREE.Color("green"))
            scene.add( gridHelper )
            // const lightHelper = new PointLightHelper(pointLight)
            // scene.add( lightHelper )
            // const axes = new THREE.AxesHelper();
            // axes.material = new THREE.MeshPhongMaterial()
            // axes.material.depthTest = false;
            // axes.renderOrder = 1;

            const clock = new THREE.Clock()

            var animate = function () {
                requestAnimationFrame( animate );

                ring.rotation.y += 0.0001
                ring.rotation.z += 0.001
            
                cube.rotation.x += 0.01;
                cube.rotation.y += 0.01;

                earth.rotation.y += 0.001

                // asteroid.rotation.z += 0.001
                asteroid.rotation.y += 0.0005

                const t = clock.getElapsedTime()

                let asteroidFlag = asteroid.getObjectByName('asteroid-flag') as THREE.Mesh
                if (typeof asteroidFlag !== 'undefined') {

                    let pos = asteroidFlag.geometry.attributes.position;
                    for (var i = 0; i < pos.count; i++) {
                        asteroidFlag.geometry.attributes.position.setZ(i, 0.25 * Math.sin(asteroidFlag.geometry.attributes.position.getX(i) + t))
                    }
                }

                asteroidFlag.geometry.attributes.position.needsUpdate = true

                // controls.update()
            
                renderer.render( scene, camera );
            };

            animate();
        }
    }

    const buildEarth = () => {
        const _texture = new THREE.TextureLoader().load('/earth_texture.jpg')
        const _normalMap = new THREE.TextureLoader().load('/earth_normal_map.png')
        const _earth = new THREE.Mesh(
            new THREE.SphereGeometry(6, 32, 32),
            new THREE.MeshStandardMaterial({
                map: _texture,
                normalMap: _normalMap
            })
        )
        _earth.rotation.y = Math.PI / 6
        return _earth
    }

    const buildAsteroid = () => {
        const _texture = new THREE.TextureLoader().load('/asteroid/Rock029_2K_Color.png')
        const _normalMap = new THREE.TextureLoader().load('/asteroid/Rock029_2K_NormalDX.png')
        const _aoMap = new THREE.TextureLoader().load('/asteroid/Rock029_2K_AmbientOcclusion.png')
        const _displacementMap = new THREE.TextureLoader().load('/asteroid/Rock029_2K_Displacement.png')
        const _roughMap = new THREE.TextureLoader().load('/asteroid/Rock029_2K_Roughness.png')
        const _asteroid = new THREE.Mesh(
            new THREE.SphereGeometry(5, 32, 32),
            new THREE.MeshStandardMaterial({
                map: _texture,
                normalMap: _normalMap,
                aoMap: _aoMap,
                aoMapIntensity: 1,
                displacementMap: _displacementMap,
                displacementScale: 0.5,
                roughnessMap: _roughMap,
                roughness: 1.0
            })
        )
        _asteroid.material.side = THREE.DoubleSide;
        _asteroid.position.set(325, 30, 22);

        const _asteroidChildren = buildAsteroidChildren() as THREE.Mesh[];

        _asteroidChildren.forEach(childNode => {
            _asteroid.add(childNode)
        });

        return _asteroid
    }

    const buildAsteroidChildren = (): THREE.Mesh[] => {
        const childrenMeshes = [] as THREE.Mesh[];

        // Construct all children of the asteroid asset.
        const _flagPole = new THREE.Mesh(
            new THREE.CylinderGeometry(0.15, 0.15, 5, 12),
            new THREE.MeshStandardMaterial({
                color: new THREE.Color("gray")
            })
        )

        _flagPole.position.set(0,6,0)
        _flagPole.rotation.set(0,Math.PI / 2, 0)

        const _flagTexture = new THREE.TextureLoader().load("/reactjs-flag.jpg")

        const _flag = new THREE.Mesh(
            new THREE.PlaneGeometry(4, 2, 15, 9),
            new THREE.MeshStandardMaterial({
                map: _flagTexture,
                side: THREE.FrontSide
            }),
        )
        _flag.material.side = THREE.DoubleSide
        _flag.position.set(2,1.5,0)
        _flag.rotation.set(-0.1, 0 ,0)
        _flag.name = "asteroid-flag"

        _flagPole.add(_flag)

        childrenMeshes.push(_flagPole)

        return childrenMeshes;
    }

    const buildStar = () => {
        const geometry = new THREE.SphereGeometry(0.25, 24, 24)
        const material = new THREE.MeshStandardMaterial({color: 0xffffff})
        const star = new THREE.Mesh( geometry, material )
        const [x, y, z] = Array(3).fill(0).map(() => THREE.MathUtils.randFloatSpread(500))

        star.position.set(x, y, z)
        return star
    }

    const buildCube = () => {
        const cubeTexture = new THREE.TextureLoader().load('/clarinet_profile.jpg')
        var geometry = new THREE.BoxGeometry( 5, 5, 5 );
        var material = new THREE.MeshStandardMaterial( { map: cubeTexture} );
        var cube = new THREE.Mesh( geometry, material );

        cube.position.set(30, 0, 0)

        return cube
    }

    const buildRing = () => {
        const geometry = new THREE.TorusGeometry( 20, 0.75, 16, 100)
        const material = new THREE.MeshStandardMaterial({ color: 0xffffff, wireframe: true})
        const ring = new THREE.Mesh( geometry, material )
        ring.rotation.x = Math.PI / 2
        
        return ring
    }

    const destructScene = () => {
        const mainSceneDiv = document.getElementById("main-scene");
        if (mainSceneDiv !== null) {
            mainSceneDiv.innerHTML = ''
        }
    }

    useEffect(() => {
        loadComponent()
        .then(() => {
            buildScene();
        })
        .then(() => {
            setLoading(false)
        })
        return () => {
            destructScene()
        }
    }, [])

    return (
        <div>
            <canvas id="main-scene">
                {/* <div id="friendly-error">
                    {error}
                </div> */}
            </canvas>
            <div id="portfolio-parent">
                test
            </div>
        </div>
    )
}