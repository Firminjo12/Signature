# SignFlow - Application de Signature de PDF

SignFlow est une application web moderne (SPA) permettant de signer des documents PDF directement dans votre navigateur. Elle est conçue pour être rapide, sécurisée (traitement local) et facile à utiliser.

## Fonctionnalités
- **Importation PDF** : Glissez-déposez n'importe quel fichier PDF.
- **Modes de Signature** : 
    - **Dessiner** : Créez votre signature manuellement (souris ou tactile).
    - **Taper** : Saisissez votre nom et choisissez parmi 5 polices calligraphiques élégantes.
    - **Importer** : Téléchargez une image de votre signature existante.
- **Éditeur Interactif** : 
    - Placez, déplacez et redimensionnez vos signatures avec précision.
    - **Zoom** : Ajustez la vue du document pour un placement précis.
    - **Navigation Multi-pages** : Signez n'importe quelle page du document.
- **Exportation Haute Qualité** : Fusionnez le PDF avec vos signatures et téléchargez le résultat instantanément.
- **Confidentialité** : Tout se passe dans votre navigateur. Aucun document n'est envoyé sur un serveur.

## Technologies utilisées
- **Frontend** : React.js, Tailwind CSS 4
- **Animations** : Framer Motion
- **Signature** : react-signature-canvas
- **Manipulation PDF** : pdf-lib, react-pdf
- **Icônes** : Lucide React

## Installation et Lancement

1.  **Prérequis** : Assurez-vous d'avoir Node.js installé sur votre machine.

2.  **Installer les dépendances** :
    ```bash
    npm install
    ```

3.  **Lancer l'application en mode développement** :
    ```bash
    npm run dev
    ```

4.  **Accéder à l'application** :
    Ouvrez votre navigateur sur [http://localhost:5173](http://localhost:5173).

## Structure du projet
- `src/components/` : Contient les composants réutilisables (Pad, Editeur, etc.).
- `src/App.jsx` : Gère le flux principal de l'application (Étapes 1-3).
- `src/index.css` : Configuration de Tailwind CSS et styles globaux.
