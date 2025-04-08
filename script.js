// Initialize Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBRKKCiY3gkMv8i-48awo-9vvJb7GK0Fp0",
  authDomain: "vroomiq-2ab14.firebaseapp.com",
  projectId: "vroomiq-2ab14",
  storageBucket: "vroomiq-2ab14.firebasestorage.app",
  messagingSenderId: "463498972089",
  appId: "1:463498972089:web:3641cb1236d5bf9ff14468",
  measurementId: "G-1SMYXHB99R"
};

console.log("Initialisation de Firebase...");

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

console.log("Firebase initialisé avec succès");

// Variable globale pour stocker les véhicules
let vehicles = {};

// Initialisation de la page
document.addEventListener('DOMContentLoaded', async () => {
    console.log("DOM chargé, début de l'initialisation...");
    
    const vehicle1Select = document.getElementById('vehicle1');
    const vehicle2Select = document.getElementById('vehicle2');
    const compareButton = document.getElementById('compareButton');
    const vehicle1Details = document.getElementById('vehicle1-details');
    const vehicle2Details = document.getElementById('vehicle2-details');

    try {
        console.log("Tentative de récupération des véhicules depuis Firestore...");
        // Récupérer les véhicules depuis Firestore
        const querySnapshot = await db.collection("vehicles").get();
        console.log("Nombre de véhicules récupérés:", querySnapshot.size);
        
        querySnapshot.forEach((doc) => {
            vehicles[doc.id] = doc.data();
            console.log("Véhicule chargé:", doc.id, doc.data());
        });

        // Si nous sommes sur la page d'accueil
        if (vehicle1Select && vehicle2Select) {
            console.log("Remplissage des menus déroulants...");
            // Remplir les menus déroulants
            for (const [id, vehicle] of Object.entries(vehicles)) {
                const option = `<option value="${id}">${vehicle.marque} ${vehicle.modele} (${vehicle.generation})</option>`;
                vehicle1Select.insertAdjacentHTML('beforeend', option);
                vehicle2Select.insertAdjacentHTML('beforeend', option);
            }

            // Gestionnaires d'événements pour les sélections
            vehicle1Select.addEventListener('change', () => {
                updateVehicleDetails(vehicle1Select.value, vehicle1Details);
                updateCompareButton();
            });

            vehicle2Select.addEventListener('change', () => {
                updateVehicleDetails(vehicle2Select.value, vehicle2Details);
                updateCompareButton();
            });

            // Gestionnaire pour le bouton de comparaison
            compareButton.addEventListener('click', () => {
                const params = new URLSearchParams();
                params.append('v1', vehicle1Select.value);
                params.append('v2', vehicle2Select.value);
                window.location.href = `compare.html?${params.toString()}`;
            });
            
            console.log("Initialisation terminée avec succès");
        }
        // Si nous sommes sur la page de comparaison
        else if (window.location.pathname.includes('compare.html')) {
            const params = new URLSearchParams(window.location.search);
            const v1 = params.get('v1');
            const v2 = params.get('v2');
            
            if (v1 && v2 && vehicles[v1] && vehicles[v2]) {
                displayComparison(vehicles[v1], vehicles[v2]);
            } else {
                window.location.href = 'index.html';
            }
        }
    } catch (error) {
        console.error("Erreur lors de la récupération des véhicules:", error);
        console.error("Détails de l'erreur:", error.message);
        if (error.stack) {
            console.error("Stack trace:", error.stack);
        }
    }
});

function updateVehicleDetails(vehicleId, detailsElement) {
    if (!vehicleId) {
        detailsElement.innerHTML = '';
        return;
    }

    const vehicle = vehicles[vehicleId];
    detailsElement.innerHTML = `
        <p><span class="label">Motorisation :</span> ${vehicle.motorisation}</p>
        <p><span class="label">Carburant :</span> ${vehicle.carburant}</p>
        <p><span class="label">Vitesse max :</span> ${vehicle.vmax} km/h</p>
        <p><span class="label">0-100 km/h :</span> ${vehicle.acceleration}s</p>
        <p><span class="label">Consommation :</span> ${vehicle.consommation} L/100km</p>
        <p><span class="label">Vignette Crit'Air :</span> ${vehicle.critair}</p>
    `;
}

function updateCompareButton() {
    const vehicle1Select = document.getElementById('vehicle1');
    const vehicle2Select = document.getElementById('vehicle2');
    const compareButton = document.getElementById('compareButton');

    compareButton.disabled = !vehicle1Select.value || !vehicle2Select.value || vehicle1Select.value === vehicle2Select.value;
}

function displayComparison(vehicle1, vehicle2) {
    const comparisonResult = document.getElementById('comparisonResult');
    
    const betterWorse = (val1, val2, higherIsBetter = true) => {
        const diff = val1 - val2;
        const better = higherIsBetter ? diff > 0 : diff < 0;
        return better ? 'better' : 'worse';
    };

    comparisonResult.innerHTML = `
        <table class="comparison-table">
            <tr>
                <th>Caractéristiques</th>
                <th>${vehicle1.marque} ${vehicle1.modele}</th>
                <th>${vehicle2.marque} ${vehicle2.modele}</th>
            </tr>
            <tr>
                <td>Génération</td>
                <td>${vehicle1.generation}</td>
                <td>${vehicle2.generation}</td>
            </tr>
            <tr>
                <td>Motorisation</td>
                <td>${vehicle1.motorisation}</td>
                <td>${vehicle2.motorisation}</td>
            </tr>
            <tr>
                <td>Carburant</td>
                <td>${vehicle1.carburant}</td>
                <td>${vehicle2.carburant}</td>
            </tr>
            <tr>
                <td>Vitesse max</td>
                <td class="${betterWorse(vehicle1.vmax, vehicle2.vmax)}">${vehicle1.vmax} km/h</td>
                <td class="${betterWorse(vehicle2.vmax, vehicle1.vmax)}">${vehicle2.vmax} km/h</td>
            </tr>
            <tr>
                <td>0-100 km/h</td>
                <td class="${betterWorse(vehicle1.acceleration, vehicle2.acceleration, false)}">${vehicle1.acceleration}s</td>
                <td class="${betterWorse(vehicle2.acceleration, vehicle1.acceleration, false)}">${vehicle2.acceleration}s</td>
            </tr>
            <tr>
                <td>Consommation</td>
                <td class="${betterWorse(vehicle1.consommation, vehicle2.consommation, false)}">${vehicle1.consommation} L/100km</td>
                <td class="${betterWorse(vehicle2.consommation, vehicle1.consommation, false)}">${vehicle2.consommation} L/100km</td>
            </tr>
            <tr>
                <td>Vignette Crit'Air</td>
                <td class="${betterWorse(vehicle2.critair, vehicle1.critair, false)}">${vehicle1.critair}</td>
                <td class="${betterWorse(vehicle1.critair, vehicle2.critair, false)}">${vehicle2.critair}</td>
            </tr>
            <tr>
                <td>Site constructeur</td>
                <td><a href="${vehicle1.url}" target="_blank" class="constructor-link">Voir le véhicule</a></td>
                <td><a href="${vehicle2.url}" target="_blank" class="constructor-link">Voir le véhicule</a></td>
            </tr>
        </table>
        
        <div class="comparison-summary">
            <h3>Analyse comparative</h3>
            ${generateComparisonSummary(vehicle1, vehicle2)}
        </div>
    `;
}

function generateComparisonSummary(v1, v2) {
    let summary = '<ul>';

    // Comparaison des performances
    if (v1.vmax !== v2.vmax) {
        const faster = v1.vmax > v2.vmax ? v1 : v2;
        summary += `<li>Le ${faster.marque} ${faster.modele} est plus rapide avec une vitesse maximale de ${faster.vmax} km/h</li>`;
    }

    if (v1.acceleration !== v2.acceleration) {
        const quicker = v1.acceleration < v2.acceleration ? v1 : v2;
        summary += `<li>Le ${quicker.marque} ${quicker.modele} est plus performant en accélération (${quicker.acceleration}s au 0-100 km/h)</li>`;
    }

    // Comparaison de la consommation
    if (v1.consommation !== v2.consommation) {
        const economical = v1.consommation < v2.consommation ? v1 : v2;
        summary += `<li>Le ${economical.marque} ${economical.modele} est plus économique avec une consommation de ${economical.consommation} L/100km</li>`;
    }

    // Comparaison Crit'Air
    if (v1.critair !== v2.critair) {
        const cleaner = v1.critair < v2.critair ? v1 : v2;
        summary += `<li>Le ${cleaner.marque} ${cleaner.modele} a une meilleure vignette Crit'Air (${cleaner.critair})</li>`;
    }

    summary += '</ul>';
    return summary;
} 