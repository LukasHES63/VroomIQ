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

// Variables globales pour stocker les véhicules
let allVehicles = [];
let filteredVehicles = [];

// Initialisation de la page
document.addEventListener('DOMContentLoaded', async () => {
    console.log("DOM chargé, début de l'initialisation...");
    
    try {
        console.log("Tentative de récupération des véhicules depuis Firestore...");
        // Récupérer les véhicules depuis Firestore
        const querySnapshot = await db.collection("vehicles").get();
        console.log("Nombre de véhicules récupérés:", querySnapshot.size);
        
        allVehicles = [];
        querySnapshot.forEach((doc) => {
            allVehicles.push({ id: doc.id, ...doc.data() });
            console.log("Véhicule chargé:", doc.id, doc.data());
        });

        // Si nous sommes sur la page d'accueil
        const vehicle1Select = document.getElementById('vehicle1');
        const vehicle2Select = document.getElementById('vehicle2');
        if (vehicle1Select && vehicle2Select) {
            console.log("Remplissage des menus déroulants...");
            
            // Mettre à jour le filtre des marques
            updateBrandFilter();
            
            // Initialiser les sélecteurs de véhicules
            updateVehicleSelectors();
            
            // Ajouter les écouteurs d'événements pour les filtres
            document.getElementById('brand1-filter').addEventListener('change', () => updateVehicleSelectors());
            document.getElementById('brand2-filter').addEventListener('change', () => updateVehicleSelectors());
            document.getElementById('fuel1-filter').addEventListener('change', () => updateVehicleSelectors());
            document.getElementById('fuel2-filter').addEventListener('change', () => updateVehicleSelectors());
            document.getElementById('critair1-filter').addEventListener('change', () => updateVehicleSelectors());
            document.getElementById('critair2-filter').addEventListener('change', () => updateVehicleSelectors());
            
            const vehicle1Details = document.getElementById('vehicle1-details');
            const vehicle2Details = document.getElementById('vehicle2-details');
            const compareButton = document.getElementById('compareButton');

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
            
            if (v1 && v2 && allVehicles.find(v => v.id === v1) && allVehicles.find(v => v.id === v2)) {
                displayComparison(allVehicles.find(v => v.id === v1), allVehicles.find(v => v.id === v2));
            } else {
                window.location.href = 'index.html';
            }
        }
        // Si nous sommes sur la page d'administration
        else if (window.location.pathname.includes('admin.html')) {
            loadVehicles();
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

    const vehicle = allVehicles.find(v => v.id === vehicleId);
    const getValue = (value) => value || 'Non renseigné';

    detailsElement.innerHTML = `
        <div class="vehicle-details-section">
            <h4>Informations générales</h4>
            <p><span class="label">Phase :</span> ${getValue(vehicle.phase)}</p>
        </div>

        <div class="vehicle-details-section">
            <h4>Motorisation</h4>
            <p><span class="label">Type :</span> ${getValue(vehicle.motorisation?.type)}</p>
            <p><span class="label">Code :</span> ${getValue(vehicle.motorisation?.code)}</p>
            <p><span class="label">Puissance :</span> ${getValue(vehicle.motorisation?.puissance)} ch</p>
            <p><span class="label">Régime puissance :</span> ${getValue(vehicle.motorisation?.puissance_tr_min)} tr/min</p>
            <p><span class="label">Couple :</span> ${getValue(vehicle.motorisation?.couple)} Nm</p>
            <p><span class="label">Régime couple :</span> ${getValue(vehicle.motorisation?.couple_tr_min)} tr/min</p>
            <p><span class="label">Cylindrée :</span> ${getValue(vehicle.motorisation?.cylindree)} cm³</p>
            <p><span class="label">Architecture :</span> ${getValue(vehicle.motorisation?.architecture)}</p>
        </div>

        <div class="vehicle-details-section">
            <h4>Boîte de vitesses</h4>
            <p><span class="label">Type :</span> ${getValue(vehicle.boite_vitesse?.type)}</p>
            <p><span class="label">Nombre de rapports :</span> ${getValue(vehicle.boite_vitesse?.rapports)}</p>
        </div>

        <div class="vehicle-details-section">
            <h4>Performances</h4>
            <p><span class="label">Vitesse max :</span> ${getValue(vehicle.performance?.vmax)} km/h</p>
            <p><span class="label">0-100 km/h :</span> ${getValue(vehicle.performance?.acceleration_0_100)}s</p>
        </div>

        <div class="vehicle-details-section">
            <h4>Consommation (L/100km)</h4>
            <p><span class="label">Mixte :</span> ${getValue(vehicle.consommation?.mixte)}</p>
            <p><span class="label">Urbaine :</span> ${getValue(vehicle.consommation?.urbaine)}</p>
            <p><span class="label">Autoroute :</span> ${getValue(vehicle.consommation?.autoroute)}</p>
        </div>

        <div class="vehicle-details-section">
            <h4>Émissions</h4>
            <p><span class="label">CO2 :</span> ${getValue(vehicle.emission_co2)} g/km</p>
            <p><span class="label">Norme Euro :</span> ${getValue(vehicle.norme_euro)}</p>
            <p><span class="label">Vignette Crit'Air :</span> ${getValue(vehicle.critair)}</p>
        </div>
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
        if (val1 === undefined || val2 === undefined) return '';
        const diff = val1 - val2;
        const better = higherIsBetter ? diff > 0 : diff < 0;
        return better ? 'better' : 'worse';
    };

    const getValue = (value) => value || 'Non renseigné';

    comparisonResult.innerHTML = `
        <table class="comparison-table">
            <tr>
                <th>Caractéristiques</th>
                <th>${vehicle1.marque} ${vehicle1.modele}</th>
                <th>${vehicle2.marque} ${vehicle2.modele}</th>
            </tr>
            <tr>
                <td>Génération</td>
                <td>${getValue(vehicle1.generation)}</td>
                <td>${getValue(vehicle2.generation)}</td>
            </tr>
            <tr>
                <td>Phase</td>
                <td>${getValue(vehicle1.phase)}</td>
                <td>${getValue(vehicle2.phase)}</td>
            </tr>
            <tr>
                <td>Type de carburant</td>
                <td>${getValue(vehicle1.motorisation?.type)}</td>
                <td>${getValue(vehicle2.motorisation?.type)}</td>
            </tr>
            <tr>
                <td>Code moteur</td>
                <td>${getValue(vehicle1.motorisation?.code)}</td>
                <td>${getValue(vehicle2.motorisation?.code)}</td>
            </tr>
            <tr>
                <td>Puissance</td>
                <td class="${betterWorse(vehicle1.motorisation?.puissance, vehicle2.motorisation?.puissance)}">${getValue(vehicle1.motorisation?.puissance)} ch</td>
                <td class="${betterWorse(vehicle2.motorisation?.puissance, vehicle1.motorisation?.puissance)}">${getValue(vehicle2.motorisation?.puissance)} ch</td>
            </tr>
            <tr>
                <td>Régime de puissance</td>
                <td>${getValue(vehicle1.motorisation?.puissance_tr_min)} tr/min</td>
                <td>${getValue(vehicle2.motorisation?.puissance_tr_min)} tr/min</td>
            </tr>
            <tr>
                <td>Couple</td>
                <td class="${betterWorse(vehicle1.motorisation?.couple, vehicle2.motorisation?.couple)}">${getValue(vehicle1.motorisation?.couple)} Nm</td>
                <td class="${betterWorse(vehicle2.motorisation?.couple, vehicle1.motorisation?.couple)}">${getValue(vehicle2.motorisation?.couple)} Nm</td>
            </tr>
            <tr>
                <td>Régime de couple</td>
                <td>${getValue(vehicle1.motorisation?.couple_tr_min)} tr/min</td>
                <td>${getValue(vehicle2.motorisation?.couple_tr_min)} tr/min</td>
            </tr>
            <tr>
                <td>Cylindrée</td>
                <td>${getValue(vehicle1.motorisation?.cylindree)} cm³</td>
                <td>${getValue(vehicle2.motorisation?.cylindree)} cm³</td>
            </tr>
            <tr>
                <td>Architecture</td>
                <td>${getValue(vehicle1.motorisation?.architecture)}</td>
                <td>${getValue(vehicle2.motorisation?.architecture)}</td>
            </tr>
            <tr>
                <td>Type de boîte</td>
                <td>${getValue(vehicle1.boite_vitesse?.type)}</td>
                <td>${getValue(vehicle2.boite_vitesse?.type)}</td>
            </tr>
            <tr>
                <td>Nombre de rapports</td>
                <td>${getValue(vehicle1.boite_vitesse?.rapports)}</td>
                <td>${getValue(vehicle2.boite_vitesse?.rapports)}</td>
            </tr>
            <tr>
                <td>Vitesse max</td>
                <td class="${betterWorse(vehicle1.performance?.vmax, vehicle2.performance?.vmax)}">${getValue(vehicle1.performance?.vmax)} km/h</td>
                <td class="${betterWorse(vehicle2.performance?.vmax, vehicle1.performance?.vmax)}">${getValue(vehicle2.performance?.vmax)} km/h</td>
            </tr>
            <tr>
                <td>0-100 km/h</td>
                <td class="${betterWorse(vehicle1.performance?.acceleration_0_100, vehicle2.performance?.acceleration_0_100, false)}">${getValue(vehicle1.performance?.acceleration_0_100)}s</td>
                <td class="${betterWorse(vehicle2.performance?.acceleration_0_100, vehicle1.performance?.acceleration_0_100, false)}">${getValue(vehicle2.performance?.acceleration_0_100)}s</td>
            </tr>
            <tr>
                <td>Consommation mixte</td>
                <td class="${betterWorse(vehicle1.consommation?.mixte, vehicle2.consommation?.mixte, false)}">${getValue(vehicle1.consommation?.mixte)} L/100km</td>
                <td class="${betterWorse(vehicle2.consommation?.mixte, vehicle1.consommation?.mixte, false)}">${getValue(vehicle2.consommation?.mixte)} L/100km</td>
            </tr>
            <tr>
                <td>Consommation urbaine</td>
                <td class="${betterWorse(vehicle1.consommation?.urbaine, vehicle2.consommation?.urbaine, false)}">${getValue(vehicle1.consommation?.urbaine)} L/100km</td>
                <td class="${betterWorse(vehicle2.consommation?.urbaine, vehicle1.consommation?.urbaine, false)}">${getValue(vehicle2.consommation?.urbaine)} L/100km</td>
            </tr>
            <tr>
                <td>Consommation autoroute</td>
                <td class="${betterWorse(vehicle1.consommation?.autoroute, vehicle2.consommation?.autoroute, false)}">${getValue(vehicle1.consommation?.autoroute)} L/100km</td>
                <td class="${betterWorse(vehicle2.consommation?.autoroute, vehicle1.consommation?.autoroute, false)}">${getValue(vehicle2.consommation?.autoroute)} L/100km</td>
            </tr>
            <tr>
                <td>Émissions CO2</td>
                <td class="${betterWorse(vehicle1.emission_co2, vehicle2.emission_co2, false)}">${getValue(vehicle1.emission_co2)} g/km</td>
                <td class="${betterWorse(vehicle2.emission_co2, vehicle1.emission_co2, false)}">${getValue(vehicle2.emission_co2)} g/km</td>
            </tr>
            <tr>
                <td>Norme Euro</td>
                <td>${getValue(vehicle1.norme_euro)}</td>
                <td>${getValue(vehicle2.norme_euro)}</td>
            </tr>
            <tr>
                <td>Vignette Crit'Air</td>
                <td class="${betterWorse(vehicle1.critair, vehicle2.critair, false)}">${getValue(vehicle1.critair)}</td>
                <td class="${betterWorse(vehicle2.critair, vehicle1.critair, false)}">${getValue(vehicle2.critair)}</td>
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
    if (v1.performance?.vmax !== v2.performance?.vmax) {
        const faster = v1.performance?.vmax > v2.performance?.vmax ? v1 : v2;
        summary += `<li>Le ${faster.marque} ${faster.modele} est plus rapide avec une vitesse maximale de ${faster.performance?.vmax} km/h</li>`;
    }

    if (v1.performance?.acceleration_0_100 !== v2.performance?.acceleration_0_100) {
        const quicker = v1.performance?.acceleration_0_100 < v2.performance?.acceleration_0_100 ? v1 : v2;
        summary += `<li>Le ${quicker.marque} ${quicker.modele} est plus performant en accélération (${quicker.performance?.acceleration_0_100}s au 0-100 km/h)</li>`;
    }

    // Comparaison de la motorisation
    if (v1.motorisation?.puissance !== v2.motorisation?.puissance) {
        const morePowerful = v1.motorisation?.puissance > v2.motorisation?.puissance ? v1 : v2;
        summary += `<li>Le ${morePowerful.marque} ${morePowerful.modele} est plus puissant avec ${morePowerful.motorisation?.puissance} ch</li>`;
    }

    if (v1.motorisation?.couple !== v2.motorisation?.couple) {
        const moreTorque = v1.motorisation?.couple > v2.motorisation?.couple ? v1 : v2;
        summary += `<li>Le ${moreTorque.marque} ${moreTorque.modele} a un meilleur couple avec ${moreTorque.motorisation?.couple} Nm</li>`;
    }

    // Comparaison de la consommation
    if (v1.consommation?.mixte !== v2.consommation?.mixte) {
        const economical = v1.consommation?.mixte < v2.consommation?.mixte ? v1 : v2;
        summary += `<li>Le ${economical.marque} ${economical.modele} est plus économique avec une consommation mixte de ${economical.consommation?.mixte} L/100km</li>`;
    }

    if (v1.consommation?.urbaine !== v2.consommation?.urbaine) {
        const cityEconomical = v1.consommation?.urbaine < v2.consommation?.urbaine ? v1 : v2;
        summary += `<li>Le ${cityEconomical.marque} ${cityEconomical.modele} est plus économique en ville avec ${cityEconomical.consommation?.urbaine} L/100km</li>`;
    }

    if (v1.consommation?.autoroute !== v2.consommation?.autoroute) {
        const highwayEconomical = v1.consommation?.autoroute < v2.consommation?.autoroute ? v1 : v2;
        summary += `<li>Le ${highwayEconomical.marque} ${highwayEconomical.modele} est plus économique sur autoroute avec ${highwayEconomical.consommation?.autoroute} L/100km</li>`;
    }

    // Comparaison des émissions
    if (v1.emission_co2 !== v2.emission_co2) {
        const cleaner = v1.emission_co2 < v2.emission_co2 ? v1 : v2;
        summary += `<li>Le ${cleaner.marque} ${cleaner.modele} émet moins de CO2 avec ${cleaner.emission_co2} g/km</li>`;
    }

    // Comparaison Crit'Air
    if (v1.critair !== v2.critair) {
        const cleaner = v1.critair < v2.critair ? v1 : v2;
        summary += `<li>Le ${cleaner.marque} ${cleaner.modele} a une meilleure vignette Crit'Air (${cleaner.critair})</li>`;
    }

    summary += '</ul>';
    return summary;
}

function showVehicleForm(mode = 'add') {
    const form = document.getElementById('vehicleForm');
    const formTitle = document.getElementById('form-title');
    const formHelp = document.querySelector('.form-help');
    
    if (mode === 'add') {
        formTitle.textContent = 'Ajouter un véhicule';
        formHelp.textContent = 'Remplissez les champs ci-dessous pour ajouter un nouveau véhicule à la base de données.';
        clearForm();
    } else {
        formTitle.textContent = 'Modifier un véhicule';
        formHelp.textContent = 'Modifiez les champs ci-dessous pour mettre à jour les informations du véhicule.';
    }
    
    form.style.display = 'block';
    form.scrollIntoView({ behavior: 'smooth' });
}

function hideVehicleForm() {
    const form = document.getElementById('vehicleForm');
    form.style.display = 'none';
}

// Admin functions
async function saveVehicle() {
    const vehicleId = document.getElementById('vehicle-id-input').value;
    if (!vehicleId) {
        alert('Veuillez spécifier un ID pour le véhicule');
        return;
    }

    const vehicleData = {
        marque: document.getElementById('vehicle-brand').value,
        modele: document.getElementById('vehicle-model').value,
        generation: document.getElementById('vehicle-generation').value,
        phase: document.getElementById('vehicle-phase').value,

        motorisation: {
            type: document.getElementById('vehicle-fuel').value,
            code: document.getElementById('vehicle-motor-code').value,
            puissance: Number(document.getElementById('vehicle-power').value) || undefined,
            puissance_tr_min: Number(document.getElementById('vehicle-power-rpm').value) || undefined,
            couple: Number(document.getElementById('vehicle-torque').value) || undefined,
            couple_tr_min: Number(document.getElementById('vehicle-torque-rpm').value) || undefined,
            cylindree: Number(document.getElementById('vehicle-engine-size').value) || undefined,
            architecture: document.getElementById('vehicle-architecture').value
        },

        boite_vitesse: {
            type: document.getElementById('vehicle-gearbox-type').value,
            rapports: Number(document.getElementById('vehicle-gear-count').value) || undefined
        },

        performance: {
            vmax: Number(document.getElementById('vehicle-vmax').value) || undefined,
            acceleration_0_100: Number(document.getElementById('vehicle-acceleration').value) || undefined
        },

        consommation: {
            mixte: Number(document.getElementById('vehicle-consumption-mixed').value) || undefined,
            urbaine: Number(document.getElementById('vehicle-consumption-city').value) || undefined,
            autoroute: Number(document.getElementById('vehicle-consumption-highway').value) || undefined
        },

        emission_co2: Number(document.getElementById('vehicle-co2').value) || undefined,
        norme_euro: document.getElementById('vehicle-euro-norm').value,
        critair: Number(document.getElementById('vehicle-critair').value) || undefined,

        url: document.getElementById('vehicle-url').value
    };

    try {
        await db.collection('vehicles').doc(vehicleId).set(vehicleData);
        hideVehicleForm();
        loadVehicles();
        alert('Véhicule enregistré avec succès!');
    } catch (error) {
        alert('Erreur lors de la sauvegarde: ' + error.message);
    }
}

// Fonction pour charger les véhicules avec filtres
async function loadVehicles() {
    try {
        console.log("Chargement des véhicules pour l'admin...");
        const snapshot = await db.collection('vehicles').get();
        allVehicles = [];
        snapshot.forEach(doc => {
            allVehicles.push({ id: doc.id, ...doc.data() });
            console.log("Véhicule chargé:", doc.id, doc.data());
        });
        
        // Mettre à jour l'affichage des véhicules dans la page admin
        const vehiclesList = document.getElementById('vehicles-list');
        if (vehiclesList) {
            vehiclesList.innerHTML = '';
            allVehicles.forEach(vehicle => {
                const vehicleElement = document.createElement('div');
                vehicleElement.className = 'vehicle-item';
                vehicleElement.innerHTML = `
                    <div class="vehicle-info">
                        <h3>${vehicle.marque} ${vehicle.modele}</h3>
                        <p>${vehicle.motorisation?.type || 'Type non spécifié'} - ${vehicle.motorisation?.code || 'Code non spécifié'}</p>
                    </div>
                    <div class="vehicle-actions">
                        <button onclick="editVehicle('${vehicle.id}')" class="edit-button">Modifier</button>
                        <button onclick="deleteVehicle('${vehicle.id}')" class="delete-button">Supprimer</button>
                        <button onclick="downloadVehicleJson('${vehicle.id}')" class="download-button">Télécharger JSON</button>
                    </div>
                `;
                vehiclesList.appendChild(vehicleElement);
            });
        }
        
        console.log("Nombre de véhicules chargés:", allVehicles.length);
    } catch (error) {
        console.error('Erreur lors du chargement des véhicules:', error);
        alert('Erreur lors du chargement des véhicules: ' + error.message);
    }
}

// Fonction pour mettre à jour le filtre des marques
function updateBrandFilter() {
    const brand1Filter = document.getElementById('brand1-filter');
    const brand2Filter = document.getElementById('brand2-filter');
    const brands = [...new Set(allVehicles.map(v => v.marque))].sort();
    
    // Mettre à jour les deux filtres de marque
    [brand1Filter, brand2Filter].forEach(filter => {
        filter.innerHTML = '<option value="">Toutes les marques</option>';
        brands.forEach(brand => {
            const option = document.createElement('option');
            option.value = brand;
            option.textContent = brand;
            filter.appendChild(option);
        });
    });
}

// Fonction pour appliquer les filtres
function applyFilters() {
    const fuelFilter = document.getElementById('fuel-filter').value;
    const critairFilter = document.getElementById('critair-filter').value;

    // Filtrer les véhicules en fonction des critères (carburant et Crit'Air)
    filteredVehicles = allVehicles.filter(vehicle => {
        const fuelMatch = !fuelFilter || vehicle.motorisation?.type === fuelFilter;
        const critairMatch = !critairFilter || vehicle.critair?.toString() === critairFilter;
        return fuelMatch && critairMatch;
    });

    // Mettre à jour les sélecteurs de véhicules
    updateVehicleSelectors();
}

// Fonction pour trier les véhicules
function sortVehicles(sortBy) {
    filteredVehicles.sort((a, b) => {
        switch (sortBy) {
            case 'marque':
                return a.marque.localeCompare(b.marque);
            case 'marque-desc':
                return b.marque.localeCompare(a.marque);
            case 'puissance':
                return (a.motorisation?.puissance || 0) - (b.motorisation?.puissance || 0);
            case 'puissance-desc':
                return (b.motorisation?.puissance || 0) - (a.motorisation?.puissance || 0);
            case 'consommation':
                return (a.consommation?.mixte || 0) - (b.consommation?.mixte || 0);
            case 'consommation-desc':
                return (b.consommation?.mixte || 0) - (a.consommation?.mixte || 0);
            default:
                return 0;
        }
    });
}

// Fonction pour mettre à jour les sélecteurs de véhicules
function updateVehicleSelectors() {
    const vehicle1Select = document.getElementById('vehicle1');
    const vehicle2Select = document.getElementById('vehicle2');
    const brand1Filter = document.getElementById('brand1-filter').value;
    const brand2Filter = document.getElementById('brand2-filter').value;
    const fuel1Filter = document.getElementById('fuel1-filter').value;
    const fuel2Filter = document.getElementById('fuel2-filter').value;
    const critair1Filter = document.getElementById('critair1-filter').value;
    const critair2Filter = document.getElementById('critair2-filter').value;
    const selectedVehicle1 = vehicle1Select.value;
    const selectedVehicle2 = vehicle2Select.value;

    // Mettre à jour le premier sélecteur avec ses filtres
    updateVehicleSelector(vehicle1Select, selectedVehicle1, brand1Filter, fuel1Filter, critair1Filter);

    // Mettre à jour le second sélecteur avec ses filtres
    updateVehicleSelector(vehicle2Select, selectedVehicle2, brand2Filter, fuel2Filter, critair2Filter);

    // Mettre à jour le bouton de comparaison
    updateCompareButton();
}

function updateVehicleSelector(select, selectedValue, brandFilter, fuelFilter, critairFilter) {
    // Garder l'option "Choisissez un véhicule"
    select.innerHTML = '<option value="">Choisissez un véhicule</option>';
    
    // Filtrer les véhicules selon les critères
    const vehiclesToShow = allVehicles.filter(vehicle => {
        const brandMatch = !brandFilter || (vehicle.marque?.toLowerCase() || '') === brandFilter.toLowerCase();
        const fuelMatch = !fuelFilter || (vehicle.motorisation?.type?.toLowerCase() || '') === fuelFilter.toLowerCase();
        const critairMatch = !critairFilter || (vehicle.critair?.toString() || '') === critairFilter;
        return brandMatch && fuelMatch && critairMatch;
    });
    
    // Ajouter les véhicules filtrés
    vehiclesToShow.forEach(vehicle => {
        const option = document.createElement('option');
        option.value = vehicle.id;
        option.textContent = `${vehicle.marque} - ${vehicle.modele} - ${vehicle.motorisation?.code || ''}`;
        if (vehicle.id === selectedValue) {
            option.selected = true;
        }
        select.appendChild(option);
    });
}

async function editVehicle(vehicleId) {
    try {
        const doc = await db.collection('vehicles').doc(vehicleId).get();
        if (doc.exists) {
            const vehicle = doc.data();
            document.getElementById('vehicle-id-input').value = vehicleId;
            document.getElementById('vehicle-brand').value = vehicle.marque;
            document.getElementById('vehicle-model').value = vehicle.modele;
            document.getElementById('vehicle-generation').value = vehicle.generation;
            document.getElementById('vehicle-phase').value = vehicle.phase || '';

            // Correction du type de carburant
            const fuelType = vehicle.motorisation?.type?.toLowerCase() || '';
            document.getElementById('vehicle-fuel').value = fuelType;

            document.getElementById('vehicle-motor-code').value = vehicle.motorisation?.code || '';
            document.getElementById('vehicle-power').value = vehicle.motorisation?.puissance || '';
            document.getElementById('vehicle-power-rpm').value = vehicle.motorisation?.puissance_tr_min || '';
            document.getElementById('vehicle-torque').value = vehicle.motorisation?.couple || '';
            document.getElementById('vehicle-torque-rpm').value = vehicle.motorisation?.couple_tr_min || '';
            document.getElementById('vehicle-engine-size').value = vehicle.motorisation?.cylindree || '';
            document.getElementById('vehicle-architecture').value = vehicle.motorisation?.architecture || '';

            // Correction du type de boîte de vitesses
            const gearboxType = vehicle.boite_vitesse?.type?.toLowerCase() || '';
            document.getElementById('vehicle-gearbox-type').value = gearboxType;

            document.getElementById('vehicle-gear-count').value = vehicle.boite_vitesse?.rapports || '';

            document.getElementById('vehicle-vmax').value = vehicle.performance?.vmax || '';
            document.getElementById('vehicle-acceleration').value = vehicle.performance?.acceleration_0_100 || '';

            document.getElementById('vehicle-consumption-mixed').value = vehicle.consommation?.mixte || '';
            document.getElementById('vehicle-consumption-city').value = vehicle.consommation?.urbaine || '';
            document.getElementById('vehicle-consumption-highway').value = vehicle.consommation?.autoroute || '';

            document.getElementById('vehicle-co2').value = vehicle.emission_co2 || '';

            // Simplification de la gestion de la norme Euro
            document.getElementById('vehicle-euro-norm').value = vehicle.norme_euro || '';

            // Correction de la vignette Crit'Air
            const critairValue = vehicle.critair?.toString() || '';
            document.getElementById('vehicle-critair').value = critairValue;

            document.getElementById('vehicle-url').value = vehicle.url || '';

            showVehicleForm('edit');
        }
    } catch (error) {
        alert('Erreur lors de la modification: ' + error.message);
    }
}

async function deleteVehicle(vehicleId) {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce véhicule ?')) {
        try {
            await db.collection('vehicles').doc(vehicleId).delete();
            loadVehicles();
            alert('Véhicule supprimé avec succès!');
        } catch (error) {
            alert('Erreur lors de la suppression: ' + error.message);
        }
    }
}

function clearForm() {
    document.getElementById('vehicle-id-input').value = '';
    document.getElementById('vehicle-brand').value = '';
    document.getElementById('vehicle-model').value = '';
    document.getElementById('vehicle-generation').value = '';
    document.getElementById('vehicle-phase').value = '';

    document.getElementById('vehicle-fuel').value = '';
    document.getElementById('vehicle-motor-code').value = '';
    document.getElementById('vehicle-power').value = '';
    document.getElementById('vehicle-power-rpm').value = '';
    document.getElementById('vehicle-torque').value = '';
    document.getElementById('vehicle-torque-rpm').value = '';
    document.getElementById('vehicle-engine-size').value = '';
    document.getElementById('vehicle-architecture').value = '';

    document.getElementById('vehicle-gearbox-type').value = '';
    document.getElementById('vehicle-gear-count').value = '';

    document.getElementById('vehicle-vmax').value = '';
    document.getElementById('vehicle-acceleration').value = '';

    document.getElementById('vehicle-consumption-mixed').value = '';
    document.getElementById('vehicle-consumption-city').value = '';
    document.getElementById('vehicle-consumption-highway').value = '';

    document.getElementById('vehicle-co2').value = '';
    document.getElementById('vehicle-euro-norm').value = '';
    document.getElementById('vehicle-critair').value = '';
    document.getElementById('vehicle-url').value = '';
}

async function importVehiclesFromJsonFiles() {
    const fileInput = document.getElementById('json-files');
    const files = fileInput.files;
    
    if (!files || files.length === 0) {
        alert('Veuillez sélectionner au moins un fichier JSON');
        return;
    }

    const progressBar = document.getElementById('import-progress');
    const progressFill = progressBar.querySelector('.progress-fill');
    const progressText = progressBar.querySelector('.progress-text');
    const importButton = document.querySelector('button[onclick="importVehiclesFromJsonFiles()"]');

    // Désactiver le bouton pendant l'import
    importButton.disabled = true;
    progressBar.style.display = 'block';

    let totalVehicles = 0;
    let processedVehicles = 0;
    let successCount = 0;
    let errorCount = 0;

    try {
        // Compter le nombre total de véhicules
        for (const file of files) {
            const text = await file.text();
            const vehicles = JSON.parse(text);
            if (Array.isArray(vehicles)) {
                totalVehicles += vehicles.length;
            }
        }

        // Importer les véhicules
        for (const file of files) {
            const text = await file.text();
            const vehicles = JSON.parse(text);
            
            if (!Array.isArray(vehicles)) {
                throw new Error('Le fichier doit contenir un tableau de véhicules');
            }

            for (const vehicle of vehicles) {
                try {
                    if (!vehicle.id || !vehicle.marque || !vehicle.modele || !vehicle.generation) {
                        throw new Error('Champs requis manquants (id, marque, modele, generation)');
                    }

                    await db.collection('vehicles').doc(vehicle.id).set(vehicle);
                    successCount++;
                } catch (error) {
                    console.error('Erreur lors de l\'import du véhicule :', error);
                    errorCount++;
                }

                processedVehicles++;
                const progress = (processedVehicles / totalVehicles) * 100;
                progressFill.style.width = `${progress}%`;
                progressText.textContent = `Import en cours... ${processedVehicles}/${totalVehicles} véhicules traités`;
            }
        }

        await loadVehicles();
        alert(`Import terminé : ${successCount} véhicules importés avec succès, ${errorCount} erreurs`);
    } catch (error) {
        alert('Erreur lors de l\'import : ' + error.message);
    } finally {
        // Réinitialiser l'interface
        importButton.disabled = false;
        progressBar.style.display = 'none';
        progressFill.style.width = '0%';
        fileInput.value = ''; // Réinitialiser le champ de fichier
    }
}

function downloadEmptyTemplate() {
    const emptyTemplate = {
        "id": "",
        "marque": "",
        "modele": "",
        "generation": "",
        "phase": "",
        "motorisation": {
            "type": "",
            "code": "",
            "puissance": null,
            "puissance_tr_min": null,
            "couple": null,
            "couple_tr_min": null,
            "cylindree": null,
            "architecture": ""
        },
        "boite_vitesse": {
            "type": "",
            "rapports": null
        },
        "performance": {
            "vmax": null,
            "acceleration_0_100": null
        },
        "consommation": {
            "mixte": null,
            "urbaine": null,
            "autoroute": null
        },
        "emission_co2": null,
        "norme_euro": "",
        "critair": null,
        "url": ""
    };

    downloadJsonFile([emptyTemplate], 'modele_vide.json');
}

function downloadExampleTemplate() {
    const exampleTemplate = [{
        "id": "megane3_dci110",
        "marque": "Renault",
        "modele": "Mégane III",
        "generation": "2008-2016",
        "phase": "Phase 2",
        "motorisation": {
            "type": "Diesel",
            "code": "1.5 dCi 110",
            "puissance": 110,
            "puissance_tr_min": 4000,
            "couple": 240,
            "couple_tr_min": 1750,
            "cylindree": 1461,
            "architecture": "4 cylindres en ligne"
        },
        "boite_vitesse": {
            "type": "Manuelle",
            "rapports": 6
        },
        "performance": {
            "vmax": 190,
            "acceleration_0_100": 11.2
        },
        "consommation": {
            "mixte": 4.2,
            "urbaine": 5.1,
            "autoroute": 3.8
        },
        "emission_co2": 110,
        "norme_euro": "Euro 5",
        "critair": 2,
        "url": "https://www.renault.fr"
    }];

    downloadJsonFile(exampleTemplate, 'exemple_vehicule.json');
}

function downloadJsonFile(data, filename) {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

async function importVehiclesFromText() {
    const jsonContent = document.getElementById('json-content').value;
    
    if (!jsonContent) {
        alert('Veuillez entrer du contenu JSON');
        return;
    }

    try {
        const vehicles = JSON.parse(jsonContent);
        if (!Array.isArray(vehicles)) {
            alert('Le JSON doit contenir un tableau de véhicules');
            return;
        }

        const importButton = document.querySelector('.import-button');
        const progressBar = document.querySelector('.progress-fill');
        const progressText = document.querySelector('.progress-text');
        
        importButton.disabled = true;
        let successCount = 0;
        let errorCount = 0;

        for (let i = 0; i < vehicles.length; i++) {
            const vehicle = vehicles[i];
            try {
                if (!vehicle.id || !vehicle.marque || !vehicle.modele || !vehicle.generation) {
                    throw new Error('Champs requis manquants (id, marque, modele, generation)');
                }

                await db.collection('vehicles').doc(vehicle.id).set(vehicle);
                successCount++;
            } catch (error) {
                console.error('Erreur lors de l\'import du véhicule :', error);
                errorCount++;
            }

            // Mise à jour de la barre de progression
            const progress = ((i + 1) / vehicles.length) * 100;
            progressBar.style.width = `${progress}%`;
            progressText.textContent = `Import en cours : ${i + 1}/${vehicles.length} véhicules`;
        }

        await loadVehicles();
        alert(`Import terminé : ${successCount} véhicules importés avec succès, ${errorCount} erreurs`);
        
        // Réinitialisation de l'interface
        importButton.disabled = false;
        progressBar.style.width = '0%';
        progressText.textContent = '';
        document.getElementById('json-content').value = '';
    } catch (error) {
        alert('Erreur lors de l\'analyse du JSON : ' + error.message);
    }
}

async function downloadVehicleJson(vehicleId) {
    try {
        const doc = await db.collection('vehicles').doc(vehicleId).get();
        if (doc.exists) {
            const vehicle = doc.data();
            const vehicleData = [{
                id: vehicleId,
                marque: vehicle.marque,
                modele: vehicle.modele,
                generation: vehicle.generation,
                phase: vehicle.phase,
                motorisation: {
                    type: vehicle.motorisation?.type,
                    code: vehicle.motorisation?.code,
                    puissance: vehicle.motorisation?.puissance,
                    puissance_tr_min: vehicle.motorisation?.puissance_tr_min,
                    couple: vehicle.motorisation?.couple,
                    couple_tr_min: vehicle.motorisation?.couple_tr_min,
                    cylindree: vehicle.motorisation?.cylindree,
                    architecture: vehicle.motorisation?.architecture
                },
                boite_vitesse: {
                    type: vehicle.boite_vitesse?.type,
                    rapports: vehicle.boite_vitesse?.rapports
                },
                performance: {
                    vmax: vehicle.performance?.vmax,
                    acceleration_0_100: vehicle.performance?.acceleration_0_100
                },
                consommation: {
                    mixte: vehicle.consommation?.mixte,
                    urbaine: vehicle.consommation?.urbaine,
                    autoroute: vehicle.consommation?.autoroute
                },
                emission_co2: vehicle.emission_co2,
                norme_euro: vehicle.norme_euro,
                critair: vehicle.critair,
                url: vehicle.url
            }];

            const jsonString = JSON.stringify(vehicleData, null, 2);
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${vehicleId}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }
    } catch (error) {
        alert('Erreur lors du téléchargement du JSON : ' + error.message);
    }
} 