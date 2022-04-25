import React, {useState, useEffect} from "react";
import { render } from "react-dom";
import * as THREE from 'three';
import { PerspectiveCamera, Scene, WebGLRenderer } from "three";


export const MainScene = () => {
    const [loading, setLoading] = useState<boolean>(true)
    const [scene, setScene] = useState<Scene>(new THREE.Scene())
    const [camera, setCamera] = useState<PerspectiveCamera>(new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 ))
    const [renderer, setRenderer] = useState<WebGLRenderer>(new THREE.WebGLRenderer())

    const loadComponent = () => new Promise((resolve, reject) => {
        // Load in any data crucial to app
        resolve (true)
    })

    const renderScene = () => {
        renderer.setSize( window.innerWidth, window.innerHeight );
        const mainSceneDiv = document.getElementById("main-scene");
        if (mainSceneDiv !== null) {
            mainSceneDiv.appendChild( renderer.domElement );
        }
    }

    useEffect(() => {
        loadComponent().then(() => {
            renderScene();
            setLoading(true)
        })
    }, [])

    return (
        <div id="main-scene">
            This is the main scene
        </div>
    )
}