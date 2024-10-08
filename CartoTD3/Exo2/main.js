const canvas = document.getElementById('renderCanvas');
const engine = new BABYLON.Engine(canvas, true); 

// Création de la scène
const createScene = function () {
    const scene = new BABYLON.Scene(engine);
    
    // Ajout d'une caméra
    const camera = new BABYLON.ArcRotateCamera("camera1", Math.PI / 2, Math.PI / 4, 12, BABYLON.Vector3.Zero(), scene);
    camera.attachControl(canvas, true);

    // Ajout d'une lumière
    const light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(1, 1, 0), scene);

    // Création d'un torus
    const torus = BABYLON.MeshBuilder.CreateTorus("torus", { diameter: 2,  thickness: 1}, scene);
    var gradientMaterial = new BABYLON.GradientMaterial("grad", scene);
    gradientMaterial.topColor = BABYLON.Color3.Blue();
    gradientMaterial.bottomColor = BABYLON.Color3.Green();
    gradientMaterial.offset = 0.25;

    torus.material = gradientMaterial;
    torus.position.y = 2.5;

    // importation d'un modèle depuis les fichiers
    BABYLON.SceneLoader.ImportMesh("", "", "scene.gltf", scene, function (newMeshes) {
        const model = newMeshes[0];
        model.position.y = 1;
        model.scaling = new BABYLON.Vector3(2, 2, 2);
    });

    // Création d'un sol
    const ground = BABYLON.MeshBuilder.CreateGround("ground", { width: 10, height: 10 }, scene);

    // Animation du torus en fonction de l'orientation du smartphone
    window.addEventListener("deviceorientation", function(event) {
        if (event.alpha !== null && event.beta !== null && event.gamma !== null) {
            torus.rotation.x = BABYLON.Tools.ToRadians(event.beta); 
            torus.rotation.y = BABYLON.Tools.ToRadians(event.alpha);
            torus.rotation.z = BABYLON.Tools.ToRadians(event.gamma); 
        }
    });

    return scene;
};

// Création de la scène
const scene = createScene();

// Boucle de rendu
engine.runRenderLoop(function () {
    scene.render();
});

// Ajustement de la taille du canvas lorsque la fenêtre change de taille
window.addEventListener('resize', function () {
    engine.resize();
});
