# VroomIQ

VroomIQ est une application Node.js conçue pour comparer différents modèles de voitures. Elle met en avant les caractéristiques techniques, les performances et d'autres critères pertinents pour aider les utilisateurs à faire un choix éclairé.

Si vous souhaitez accéder au site voici le lien : https://vroomiq-efa93.firebaseapp.com/

## 👍Versions

- 1.0.0 : Première version du projet
- 1.1.0 : Ajout d'une base de donnée
- 1.2.0 : Ajout d'une console d'administration
- 1.2.1 : Ajout de fonction d'administration avancé
- 1.2.2 : Ajout de filtres sur l'index.html
- 1.2.3 : Ajout de playwright pour les tests
- 1.2.4 : Correction de certains problèmes

## 🚀 Fonctionnalités
- Comparaison de modèles de voitures par marque, année, motorisation, etc.
- Affichage clair et synthétique des caractéristiques techniques.
- Utilisation de Firebase et Firebase SDK pour la gestion des données.

## 🛠️ Installation

1. **Cloner le dépôt** :
   ```bash
   git clone https://github.com/LukasHES63/VroomIQ.git
   cd VroomIQ
2. **Ouvrir le fichier "index.html"**
   ```bash
   index.html
   
## 🧪Les tests
Pour tester l'application, vous pouvez effectuer des tests manuelles toutefois nous proposons des scripts pour effectuer cette tâche. 
Les scripts sont disponibles dans le répertoire "tests".

Pour exécuter un test en local vous pouvez suivre les instructions suivantes :
1. Nous avons besoins de Node.js installer le ici > https://nodejs.org/fr
2. Ouvrez un terminal et dirigez-vous dans le répertoire du projet.
3. Voici la commande a utiliser pour exécuter le script de test
   ```bash
   npx playwright test
4. Si vous souhaitez exécuter un test spécifique voici la commande
   ```bash
   npx playwright test tests/ test_basic_usage.spec.ts
5. Les résultats des tests sont disponibles dans le répertoire playwright-report, nous retrouvons une page html de vérification des tests
   ```bash
   index.html



 
 


