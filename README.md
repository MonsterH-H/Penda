# Industria - Application de Maintenance Prédictive

## Description du Projet

Industria est une application web de pointe conçue pour la surveillance et la maintenance prédictive des équipements industriels. En exploitant la puissance de l'apprentissage automatique (Machine Learning) avec TensorFlow.js, elle permet aux entreprises d'anticiper les pannes, d'optimiser les opérations de maintenance et d'améliorer l'efficacité globale de leurs actifs.

L'application offre une interface intuitive pour le téléchargement, le traitement et l'analyse des données de capteurs, transformant les données brutes en informations exploitables pour une prise de décision éclairée.

## Fonctionnalités Clés

*   **Téléchargement et Traitement des Données :** Importez facilement des données de capteurs au format CSV ou JSON. L'application gère le mappage automatique et manuel des colonnes (horodatage, machine, température, pression, vibration, rotation, courant, tension).
*   **Prévisualisation des Données :** Visualisez un aperçu des données téléchargées avant de les traiter pour assurer leur conformité.
*   **Entraînement de Modèles ML :** Entraînez des modèles d'autoencodeurs basés sur TensorFlow.js pour la détection d'anomalies. L'application permet de charger des modèles existants ou d'en créer de nouveaux.
*   **Prédiction et Détection d'Anomalies :** Effectuez des prédictions pour identifier les comportements anormaux des équipements et calculez les erreurs de reconstruction pour évaluer la gravité des anomalies.
*   **Visualisation des Métriques du Modèle :** Suivez les performances de vos modèles grâce à des métriques clés telles que la précision, le rappel et le score F1.
*   **Affichage Détaillé des Anomalies :** Obtenez des informations détaillées sur chaque anomalie détectée, y compris sa gravité et les facteurs contributifs.
*   **Contrôle du Modèle :** Gérez vos modèles ML directement depuis l'interface utilisateur, avec des options pour le réentraînement et la mise à jour des données.
*   **Gestion des Utilisateurs :** Intègre des fonctionnalités d'authentification et de gestion de profil pour un accès sécurisé et personnalisé.

## Cas d'Utilisation

Industria est un outil essentiel pour les industries cherchant à optimiser leurs opérations de maintenance et à prolonger la durée de vie de leurs équipements :

*   **Maintenance Prédictive :** Anticipez les défaillances d'équipements en détectant les signes avant-coureurs d'anomalies, permettant une planification proactive des interventions et une réduction significative des temps d'arrêt imprévus.
*   **Surveillance Continue de la Santé des Machines :** Surveillez en temps réel l'état de fonctionnement de vos machines industrielles en analysant les données de capteurs, garantissant une performance optimale.
*   **Optimisation des Processus :** Identifiez les inefficacités ou les déviations par rapport aux conditions de fonctionnement normales, contribuant à l'amélioration continue des processus industriels.
*   **Analyse des Causes Racines :** Comprenez les origines des anomalies grâce à l'identification des facteurs contributifs, facilitant la mise en œuvre de solutions correctives ciblées et durables.
*   **Gestion Stratégique des Actifs :** Obtenez une vue d'ensemble de la santé de votre parc machine pour une gestion plus efficace des actifs et une allocation optimisée des ressources.

## Technologies Utilisées

*   **Frontend :** React, TypeScript, Tailwind CSS
*   **Machine Learning :** TensorFlow.js
*   **Gestion des Dépendances :** npm

## Installation

Pour installer et exécuter l'application Industria en local, suivez les étapes ci-dessous :

1.  **Cloner le dépôt :**
    ```bash
    git clone <URL_DU_DEPOT>
    cd industria-main
    ```

2.  **Installer les dépendances :**
    ```bash
    npm install
    ```
    *Note : Des vulnérabilités de sécurité peuvent être signalées lors de l'installation. Il est recommandé d'exécuter `npm audit fix` si nécessaire.*

3.  **Démarrer l'application en mode développement :**
    ```bash
    npm run dev
    ```
    L'application sera accessible via votre navigateur à l'adresse `http://localhost:8081/` (ou un autre port si le 8080 est déjà utilisé).

## Structure du Projet

Le projet est organisé comme suit :

```
industria-main/
├── public/                   # Fichiers statiques (images, favicon)
├── src/                      # Code source de l'application
│   ├── adapters/             # Adaptateurs pour la logique métier (données, ML)
│   ├── api/                  # Services d'API pour l'interaction backend
│   ├── components/           # Composants React réutilisables (UI, dashboard, auth, etc.)
│   │   ├── auth/
│   │   ├── dashboard/
│   │   ├── data/
│   │   ├── historique/
│   │   ├── layout/
│   │   ├── parametres/
│   │   ├── prediction/
│   │   └── ui/
│   ├── config/               # Fichiers de configuration
│   ├── contexts/             # Contextes React pour la gestion d'état globale (Auth, Data, MLModel)
│   ├── hooks/                # Hooks React personnalisés
│   ├── lib/                  # Utilitaires et fonctions helper
│   ├── pages/                # Pages principales de l'application
│   ├── services/             # Services pour la logique métier spécifique
│   ├── types/                # Définitions de types TypeScript
│   └── utils/                # Fonctions utilitaires
├── datasets/                 # Exemple de données (e.g., equipment_anomaly_data.csv)
├── package.json              # Métadonnées du projet et dépendances
├── tailwind.config.ts        # Configuration de Tailwind CSS
├── tsconfig.json             # Configuration TypeScript
└── vite.config.ts            # Configuration de Vite
```

## Contribution

Pour contribuer au projet, veuillez suivre les directives de contribution (à définir).

## Licence

Ce projet est sous licence [Nom de la Licence, ex: MIT]. Voir le fichier `LICENSE` pour plus de détails.
