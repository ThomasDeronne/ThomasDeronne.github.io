const canvas = document.getElementById('renderCanvas');
const engine = new BABYLON.Engine(canvas, true); 

// fonction conversion lat/lon coordonnées cartésiennes
function latLonToCartesian(lat, lon, radius) {
    const phi = (90 - lat) * Math.PI / 180;
    const theta = (lon + 180) * Math.PI / 180;
    return new BABYLON.Vector3(
        radius * Math.sin(phi) * Math.cos(theta),
        radius * Math.cos(phi),
        radius * Math.sin(phi) * Math.sin(theta)
    );
}

// récupère une liste de cordonnées de pays avec https://restcountries.com/
async function fetchCountries() {
    const response = await fetch('https://restcountries.com/v3.1/all');
    const countries = await response.json();
    console.log(countries);

    countries.forEach(country => {
        const lat = country.latlng[0];
        const lon = country.latlng[1];
        const pos = latLonToCartesian(lat, lon, 3.5);
        const marker = BABYLON.MeshBuilder.CreateSphere("marker", {diameter: 0.07}, scene);
        marker.position = pos;
        marker.material = new BABYLON.StandardMaterial("markerMat", scene);
        marker.material.diffuseTexture = new BABYLON.Texture(country.flags.png, scene);
        marker.material.diffuseTexture.hasAlpha = true;
        marker.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL;
    });
}

// Création de la scène
const createScene = function () {
    const scene = new BABYLON.Scene(engine);
    
    // Ajout d'une caméra
    const camera = new BABYLON.ArcRotateCamera("camera1", Math.PI / 2, Math.PI / 4, 7, BABYLON.Vector3.Zero(), scene);
    camera.attachControl(canvas, true);

    // Ajout d'une lumière
    const light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1, 0), scene);
    light.intensity = 1;

    // Ajout d'une sphère pour la terre
    const sphere = BABYLON.MeshBuilder.CreateSphere("sphere", {diameter: 7}, scene);
    sphere.material = new BABYLON.StandardMaterial("sphereMat", scene);
    sphere.material.diffuseTexture = new BABYLON.Texture("2k_earth_daymap.jpg", scene);
    sphere.material.diffuseTexture.vScale = -1;
    sphere.scaling = new BABYLON.Vector3(1, 1, -1);


    // récupéré position et ajouté marqueur
    const pos = latLonToCartesian(43.6165007 , 7.071014, 3.5); // 3.5 -> le rayon de la sphere (7/2)
    BABYLON.SceneLoader.ImportMesh("", "Soldier.glb", "", scene, function (meshes) {
        const marker = meshes[0];
        marker.position = pos;
        marker.scaling = new BABYLON.Vector3(0.1, 0.1, 0.1);
    });
    console.log(pos);

    fetchCountries();

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