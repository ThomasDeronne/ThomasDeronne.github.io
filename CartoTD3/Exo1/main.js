import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// Création de la scène, de la caméra et du rendu
var scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 100, window.innerWidth / window.innerHeight, 0.1, 1000 ); 
const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setAnimationLoop( render );
document.body.appendChild( renderer.domElement );

// positionnement de la caméra
camera.position.set(2, 2, 5);
camera.lookAt(0, 0, 0);

// ajout d'un objet importé
const loader = new GLTFLoader();
loader.load('scene.gltf', function(gltf){
    const model = gltf.scene;

    model.position.set(0, 0, 3.5);
    model.scale.set(1, 1, 1);

    scene.add(model);
}, undefined, function (error) {
    console.error('Une erreur s\'est produite lors du chargement du modèle :', error);
});


// Création d'un cube
const geometry = new THREE.SphereGeometry( 1, 22, 16 );
const material = new THREE.MeshBasicMaterial( { color: 0xff0921} );
const sphere = new THREE.Mesh( geometry, material );
scene.add( sphere );

//création d'un plan
const geometry2 = new THREE.PlaneGeometry( 10, 10 );
const material2 = new THREE.MeshBasicMaterial( { color: 0xc0c0c0, side: THREE.DoubleSide } );
const plane = new THREE.Mesh( geometry2, material2 );
scene.add( plane );


// ajout de la lumière 
const light = new THREE.DirectionalLight(0xdddddd, 0.8);
light.position.set(0, 10, 0);
scene.add(light);

// particle system
const geometry3 = new THREE.SphereGeometry(1, 32, 32);
const particlesMaterial = new THREE.PointsMaterial({ color: 0x888888});
particlesMaterial.size = 0.02;
particlesMaterial.sizeAttenuation = true;

const particleSystem = new THREE.Points(geometry3, particlesMaterial);
particleSystem.position.y = 2;
scene.add(particleSystem);

// Événement DeviceOrientation pour la rotation
window.addEventListener('deviceorientation', (event) => {
    alpha = event.alpha; 
    beta = event.beta;
    gamma = event.gamma;

    if (model) {
        model.rotation.set(
            THREE.MathUtils.degToRad(beta),
            THREE.MathUtils.degToRad(gamma),
            THREE.MathUtils.degToRad(alpha)
        );
    }
});

// Événement DeviceMotion pour le mouvement
window.addEventListener('devicemotion', (event) => {
    const acceleration = event.acceleration;
    
    if (sphere) {
        sphere.position.x += acceleration.x * 0.01; 
        sphere.position.y += acceleration.y * 0.01;
        sphere.position.z += acceleration.z * 0.01;
    }
});

// positionnement du plan
plane.rotation.x = Math.PI / 2;
plane.position.y = -1;

// fonction du rendu
function render() { 
    renderer.render( scene, camera );
}