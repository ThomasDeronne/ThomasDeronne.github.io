// Vérifie si le navigateur prend en charge la géolocalisation
if ("geolocation" in navigator) {
    // Obtient la position actuelle de l'utilisateur
    navigator.geolocation.getCurrentPosition(function(position) {
        // Récupère les coordonnées de latitude et longitude
        const span_latitude = document.getElementById("latitude");
        const span_longitude = document.getElementById("longitude");

        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        span_latitude.textContent = latitude;
        span_longitude.textContent = longitude;
    });
} else {
    console.log("La géolocalisation n'est pas prise en charge par ce navigateur.");
}