const canvas = document.getElementById('renderCanvas');
const engine = new BABYLON.Engine(canvas, true); 

// initialisation de map
let map;
let camera3D;

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

//récupération de la postion actuelle
function getPosition() {
    navigator.geolocation.getCurrentPosition((position) => {
        const pos = latLonToCartesian(position.coords.latitude, position.coords.longitude, 3.5);
        BABYLON.SceneLoader.ImportMesh("", "Soldier.glb", "", scene, function (meshes) {
            const marker = meshes[0];
            marker.position = pos;
            marker.scaling = new BABYLON.Vector3(0.1, 0.1, 0.1);
        });
    });
}

// liste de cordonnées de pays avec https://restcountries.com/
async function fetchCountries() {
    const response = await fetch('https://restcountries.com/v3.1/all');
    const countries = await response.json();
    console.log(countries);

    return countries;
}

// afficher la map leaflet
async function showMap() {
    const response = await fetch('https://restcountries.com/v3.1/all');
    const countries = await response.json();

    navigator.geolocation.getCurrentPosition((position) => {
        map = L.map('map').setView([position.coords.latitude, position.coords.longitude], 2);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

        countries.forEach(country => {
            const lat = country.latlng[0];
            const lon = country.latlng[1];
            const marker = L.marker([lat, lon]).addTo(map);
            marker.bindPopup(`<b>${country.name.common}</b><br><img src="${country.flags.png}" width="100px">`);

            // Ajout d'un événement de clic pour zoomer sur la carte 3D
            marker.on('click', function() {
                zoomOnMap3D(lat, lon);
            });
        });
    });
}

// Fonction pour zoomer sur la carte 2D
function zoomOnMap2D(lat, lon) {
    if (map) {
        map.setView([lat, lon], 5); // ajustez le niveau de zoom selon vos besoins
    } else {
        console.error('La carte Leaflet n\'est pas encore initialisée.');
    }
}

// Fonction pour zoomer sur la carte 3D
function zoomOnMap3D(lat, lon) {
    if (camera3D) {
        const targetPosition = latLonToCartesian(lat, lon, 3.5); // Conversion lat/lon en coordonnées 3D
        camera3D.setTarget(targetPosition); // Fixer la caméra sur la position
        camera3D.radius = 5; // Zoomer plus près du point cible
    } else {
        console.error('La caméra 3D n\'est pas encore initialisée.');
    }
}

// Création de la scène
const createScene = function () {
    const scene = new BABYLON.Scene(engine);
    
    // Ajout d'une caméra
    camera3D = new BABYLON.ArcRotateCamera("camera1", Math.PI / 2, Math.PI / 4, 7, BABYLON.Vector3.Zero(), scene);
    camera3D.attachControl(canvas, true)

    // Ajout d'une lumière
    const light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1, 0), scene);
    light.intensity = 1;

    // bouton pour reset la camera
    const button = document.createElement('button');
    button.textContent = 'Reset Camera';
    button.style.position = 'absolute';
    button.style.top = '10px';
    button.style.left = '10px';
    button.onclick = function() {
        camera3D.radius = 7;
        camera3D.target = BABYLON.Vector3.Zero();
    };
    document.body.appendChild(button);

    // Ajout d'une sphère pour la terre
    const sphere = BABYLON.MeshBuilder.CreateSphere("sphere", {diameter: 7}, scene);
    sphere.material = new BABYLON.StandardMaterial("sphereMat", scene);
    sphere.material.diffuseTexture = new BABYLON.Texture("2k_earth_daymap.jpg", scene);
    sphere.material.diffuseTexture.vScale = -1;
    sphere.scaling = new BABYLON.Vector3(1, 1, -1);

    // récupération des pays et ajout des marqueurs sur la carte 3d
    fetchCountries().then(countries => {
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

            marker.actionManager = new BABYLON.ActionManager(scene);
            // over
            marker.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPointerOverTrigger, function() {
                marker.scaling = new BABYLON.Vector3(1.5, 1.5, 1.5);
            }));
            // out
            marker.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPointerOutTrigger, function() {
                marker.scaling = new BABYLON.Vector3(1, 1, 1);
            }));
            // click
            marker.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPickTrigger, function() {
                zoomOnMap2D(lat, lon);
            }));
        });
    });

    showMap();

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