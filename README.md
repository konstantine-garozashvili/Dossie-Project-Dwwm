# DWWM Computer Repair Shop Project

Ce projet est une plateforme web pour un service de réparation informatique qui vend également des ordinateurs, des ordinateurs portables et des pièces connexes.

## Structure du Projet

Le projet est divisé en deux parties principales :

- **Frontend** : Application React avec Shadcn UI, Magic UI et Tailwind CSS
- **Backend** : API Node.js avec le framework Hono et base de données SQLite

## Technologies Utilisées

### Frontend
- React 18
- Shadcn UI
- Magic UI
- Tailwind CSS v3
- Framer Motion (pour les animations)
- React Router (pour la navigation)

### Backend
- Node.js
- Hono (framework API)
- SQLite (base de données)
- DBeaver (gestion de base de données)

## Installation et Configuration

### Prérequis
- Node.js (v16 ou supérieur)
- npm ou yarn

### Installation du Frontend

```bash
cd frontend
npm install
npm run dev
```

L'application frontend sera accessible à l'adresse http://localhost:5173

### Installation du Backend

```bash
cd backend
npm install
npm run dev
```

L'API backend sera accessible à l'adresse http://localhost:8000

## Structure de la Base de Données

La base de données SQLite est automatiquement créée lors du démarrage du backend. Elle comprend les tables suivantes :

- **clients** : Informations sur les clients (particuliers ou entreprises)
- **client_contacts** : Coordonnées des contacts clients
- **technicians** : Informations sur les techniciens
- **service_requests** : Demandes de service
- **assignments** : Affectations des techniciens aux demandes
- **service_notes** : Notes sur les interventions

## Fonctionnalités Principales

### Parcours Client

1. **Demande d'Intervention** : Formulaire multi-étapes pour soumettre une demande de réparation
2. **Confirmation et Priorisation** : Confirmation automatique et attribution d'un niveau de priorité
3. **Analyse et Affectation** : Évaluation par l'équipe support et affectation à un technicien
4. **Planification Intervention** : Organisation du rendez-vous avec le client
5. **Réalisation et Suivi** : Intervention et documentation en temps réel
6. **Clôture et Validation** : Rapport d'intervention et validation client
7. **Suivi Qualité** : Enquête de satisfaction et analyse des performances

### Tableau de Bord Administratif

- Gestion des demandes de service
- Affectation des techniciens
- Suivi des interventions
- Rapports et statistiques

## API Endpoints

### Service Requests

- `GET /api/service-requests` : Récupérer toutes les demandes de service
- `GET /api/service-requests/:id` : Récupérer une demande de service par ID
- `POST /api/service-requests` : Créer une nouvelle demande de service
- `PATCH /api/service-requests/:id` : Mettre à jour une demande de service
- `POST /api/service-requests/:id/notes` : Ajouter une note à une demande de service

## Développement

### Structure des Fichiers Frontend

```
frontend/
├── src/
│   ├── assets/        # Images, icônes, etc.
│   ├── components/    # Composants React réutilisables
│   │   ├── ui/        # Composants UI (Shadcn UI)
│   │   └── magicui/   # Composants Magic UI
│   ├── lib/           # Utilitaires et fonctions
│   ├── pages/         # Pages de l'application
│   ├── App.jsx        # Composant principal
│   ├── main.jsx       # Point d'entrée
│   └── index.css      # Styles globaux
└── ...
```

### Structure des Fichiers Backend

```
backend/
├── data/             # Dossier contenant la base de données SQLite
├── src/
│   ├── controllers/  # Contrôleurs pour la logique métier
│   ├── db/           # Configuration et initialisation de la base de données
│   ├── handlers/     # Gestionnaires de requêtes
│   ├── models/       # Modèles de données
│   ├── routes/       # Définition des routes API
│   ├── services/     # Services métier
│   └── index.js      # Point d'entrée
└── ...
```

## Règles du Projet

Les règles du projet sont définies dans le fichier `.cursorrules` à la racine du projet. Elles incluent des directives sur la structure des fichiers, les conventions de codage, et les meilleures pratiques à suivre.

## Contribution

Pour contribuer au projet, veuillez suivre les étapes suivantes :

1. Créez une branche pour votre fonctionnalité (`git checkout -b feature/ma-fonctionnalite`)
2. Committez vos changements (`git commit -m 'Ajout de ma fonctionnalité'`)
3. Poussez vers la branche (`git push origin feature/ma-fonctionnalite`)
4. Ouvrez une Pull Request

## Licence

Ce projet est développé dans le cadre d'un diplôme DWWM et est soumis aux conditions spécifiées par l'établissement de formation.