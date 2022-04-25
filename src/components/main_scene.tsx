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
                canvas: mainSceneDiv
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
            // const ring = buildRing()
            // scene.add( ring );
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
                
                camera.position.x = top * -0.2
                camera.position.y = top * -0.02
                // camera.position.z = top * -0.02
                camera.lookAt(0,0,0)
            }

            // Add helpers
            // const gridHelper = new THREE.GridHelper(200, 50)
            // scene.add( gridHelper )
            // const lightHelper = new PointLightHelper(pointLight)
            // scene.add( lightHelper )

            var animate = function () {
                requestAnimationFrame( animate );

                // ring.rotation.x += 0.01
                // ring.rotation.y += 0.005
                // ring.rotation.z += 0.01
            
                cube.rotation.x += 0.01;
                cube.rotation.y += 0.01;

                earth.rotation.y += 0.001

                // controls.update()
            
                renderer.render( scene, camera );
            };

            animate();
        }
    }

    const buildEarth = () => {
        const earthTexture = new THREE.TextureLoader().load('/earth_texture.jpg')
        const earth = new THREE.Mesh(
            new THREE.SphereGeometry(6, 32, 32),
            new THREE.MeshStandardMaterial({
                map: earthTexture
            })
        )
        earth.rotation.y = Math.PI / 6
        return earth
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
        var geometry = new THREE.BoxGeometry( 1, 1, 1 );
        var material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
        var cube = new THREE.Mesh( geometry, material );

        return cube
    }

    const buildRing = () => {
        const geometry = new THREE.TorusGeometry( 10, 3, 16, 100)
        const material = new THREE.MeshStandardMaterial({ color: 0xFF637})
        const ring = new THREE.Mesh( geometry, material )
        
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