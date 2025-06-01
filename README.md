# Bienvenue dans votre projet Penda

## Project info

**Application de surveillance industrielle intelligente**

## How can I edit this code?

There are several ways of editing your application.

**Utiliser Penda**

Démarrez l'application localement et commencez à surveiller vos équipements industriels.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

## Technologies utilisées

- **Frontend** :
  - [Vite](https://vitejs.dev/) - Build tool et serveur de développement ultra-rapide
  - [React](https://reactjs.org/) - Bibliothèque UI déclarative
  - [TypeScript](https://www.typescriptlang.org/) - Pour un code plus robuste et maintenable
  - [Tailwind CSS](https://tailwindcss.com/) - Framework CSS utility-first
  - [shadcn/ui](https://ui.shadcn.com/) - Composants d'interface réutilisables
  - [React Router](https://reactrouter.com/) - Routage et navigation
  - [TensorFlow.js](https://www.tensorflow.org/js) - Machine learning dans le navigateur

- **Outils de développement** :
  - ESLint - Linting du code
  - Prettier - Formatage du code
  - Husky - Hooks Git

## Fonctionnalités principales

### 1. Surveillance en temps réel
- Visualisation des données des capteurs en temps réel
- Statut des machines et métriques de performance
- Alertes immédiates en cas d'anomalie

### 2. Analyse des données historiques
- Visualisation des tendances historiques
- Filtrage par période et par machine
- Export des données pour analyse externe

### 3. Détection d'anomalies par ML
- Modèle de machine learning intégré
- Entraînement sur les données spécifiques de votre équipement
- Prédiction des défaillances avant qu'elles ne se produisent

### 4. Gestion des données
- Import et export de données
- Validation et nettoyage automatique
- Intégration avec les systèmes industriels existants

## Installation

```bash
# Cloner le dépôt
git clone https://github.com/votre-utilisateur/penda.git
cd penda

# Installer les dépendances
npm install

# Démarrer le serveur de développement
npm run dev
```

## Déploiement

```bash
# Construire l'application pour la production
npm run build
```

Le résultat de la construction se trouve dans le dossier `dist` et peut être déployé sur n'importe quel serveur web statique.

## Structure du projet

```
src/
u251cu2500u2500 adapters/     # Adaptateurs pour traiter les données
u251cu2500u2500 api/          # Services d'API pour communiquer avec le backend
u251cu2500u2500 components/   # Composants réutilisables
u251cu2500u2500 config/       # Configuration de l'application
u251cu2500u2500 contexts/     # Contextes React pour l'état global
u251cu2500u2500 hooks/        # Hooks personnalisés
u251cu2500u2500 lib/          # Bibliothèques et utilitaires
u251cu2500u2500 pages/        # Composants de page
u251cu2500u2500 types/        # Définitions de types TypeScript
u251cu2500u2500 utils/        # Fonctions utilitaires
u2514u2500u2500 App.tsx       # Point d'entrée de l'application
```

## À propos de Penda

Penda est une application de surveillance industrielle intelligente qui utilise l'apprentissage automatique pour détecter les anomalies dans les équipements industriels en temps réel.

Conçue pour maximiser l'efficacité opérationnelle et minimiser les temps d'arrêt, Penda analyse en continu les données provenant des capteurs industriels pour identifier les comportements anormaux avant qu'ils ne deviennent des problèmes critiques.

### Cas d'utilisation

- **Maintenance prédictive** : Détection précoce des défaillances d'équipement
- **Optimisation des processus** : Analyse des performances pour améliorer l'efficacité
- **Contrôle qualité** : Identification des écarts dans les processus de production
- **Sécurité** : Alertes en temps réel pour les conditions dangereuses

## Licence

[MIT](LICENSE)

---

© 2025 Penda Technologies. Tous droits réservés.
