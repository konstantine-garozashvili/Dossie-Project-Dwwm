# GitHub Project Roadmap - Computer Repair Shop Website

Ce document décrit les étapes nécessaires pour compléter le projet de site web pour un magasin de réparation informatique, y compris l'intégration de Firebase pour les notifications.

## Table des Matières

1. [Configuration Initiale](#configuration-initiale)
2. [Développement Frontend](#développement-frontend)
3. [Développement Backend](#développement-backend)
4. [Intégration de Firebase](#intégration-de-firebase)
5. [Tests et Déploiement](#tests-et-déploiement)

## Configuration Initiale

### 1. Configuration du Dépôt GitHub

- [x] Créer un nouveau dépôt sur GitHub
- [x] Initialiser la structure du projet avec les dossiers frontend et backend
- [x] Configurer le fichier `.gitignore` pour exclure les fichiers sensibles et les dépendances
- [x] Créer le fichier `.cursorrules` pour définir les règles du projet
- [x] Ajouter les fichiers README.md et documentation initiale

### 2. Configuration de l'Environnement de Développement

- [x] Configurer l'éditeur Cursor
- [x] Installer les dépendances nécessaires pour le frontend et le backend
- [x] Configurer les fichiers d'environnement (.env.example)

## Développement Frontend

### 1. Structure de Base

- [x] Configurer React 18 avec Vite
- [x] Installer et configurer Tailwind CSS v3
- [x] Installer Shadcn UI et Magic UI
- [x] Configurer React Router pour la navigation

### 2. Composants UI

- [x] Créer les composants UI de base avec Shadcn UI
- [x] Implémenter les composants Magic UI pour les animations
- [x] Développer la structure de mise en page (Layout)

### 3. Pages et Fonctionnalités

- [x] Créer la page d'accueil
- [x] Développer les pages de services
- [x] Implémenter les formulaires de demande de service
- [x] Créer les tableaux de bord pour les clients, techniciens et administrateurs
- [x] Développer les pages de connexion et d'inscription

### 4. Intégration Firebase Frontend

- [ ] Installer le SDK Firebase
- [ ] Configurer Firebase dans l'application React
- [ ] Créer un service de notification pour gérer les messages Firebase
- [ ] Implémenter la demande d'autorisation de notification
- [ ] Développer les composants UI pour afficher les notifications

## Développement Backend

### 1. Structure de Base

- [x] Configurer le serveur Hono
- [x] Mettre en place la structure des routes et des contrôleurs
- [x] Configurer la base de données SQLite
- [x] Implémenter la création automatique de la base de données

### 2. API et Endpoints

- [x] Développer les endpoints pour les clients
- [x] Créer les endpoints pour les demandes de service
- [x] Implémenter les endpoints pour les techniciens
- [x] Développer les endpoints pour les candidatures de techniciens

### 3. Modèles et Services

- [x] Créer les modèles de données pour les clients, techniciens et services
- [ ] Développer les services métier pour la logique d'application
- [ ] Implémenter la validation des données

### 4. Intégration Firebase Backend

- [ ] Installer le SDK Firebase Admin
- [ ] Configurer Firebase Admin dans le serveur Hono
- [ ] Créer un service de notification pour envoyer des messages
- [ ] Développer des endpoints pour gérer les tokens d'appareil
- [ ] Implémenter la logique de notification pour les événements importants

## Intégration de Firebase

### 1. Configuration du Projet Firebase

- [ ] Créer un nouveau projet dans la console Firebase
- [ ] Configurer Firebase Cloud Messaging (FCM)
- [ ] Générer et télécharger les fichiers de configuration
- [ ] Configurer les règles de sécurité Firebase

### 2. Implémentation des Notifications

- [ ] Créer un service de notification partagé entre frontend et backend
- [ ] Implémenter les notifications pour les mises à jour de statut des réparations
- [ ] Développer les notifications pour les nouvelles demandes de service
- [ ] Configurer les notifications pour les messages entre clients et techniciens

### 3. Stockage et Authentification (Optionnel)

- [ ] Configurer Firebase Storage pour le stockage des images
- [ ] Implémenter l'authentification Firebase (si nécessaire)
- [ ] Intégrer Firebase Analytics pour le suivi des utilisateurs

## Tests et Déploiement

### 1. Tests

- [ ] Effectuer des tests manuels de toutes les fonctionnalités
- [ ] Tester les notifications Firebase sur différents appareils
- [ ] Vérifier la compatibilité cross-browser

### 2. Préparation au Déploiement

- [ ] Optimiser les performances de l'application
- [ ] Configurer les variables d'environnement pour la production
- [ ] Préparer les scripts de build et de déploiement

### 3. Déploiement

- [ ] Déployer le frontend sur un service d'hébergement (Vercel, Netlify, etc.)
- [ ] Déployer le backend sur un service cloud (Heroku, Railway, etc.)
- [ ] Configurer les domaines et les certificats SSL

## Guide d'Implémentation Firebase

### Installation des Dépendances

#### Frontend
```bash
npm install firebase
```

#### Backend
```bash
npm install firebase-admin
```

### Configuration Firebase Frontend

```javascript
// src/lib/firebase.js
import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

// Request permission and get token
export const requestNotificationPermission = async () => {
  try {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      const token = await getToken(messaging, {
        vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY
      });
      
      // Send token to backend
      await fetch("/api/notifications/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token })
      });
      
      return token;
    }
  } catch (error) {
    console.error("Notification permission error:", error);
  }
};

// Handle foreground messages
export const onMessageListener = () => {
  return new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      resolve(payload);
    });
  });
};
```

### Configuration Firebase Backend

```javascript
// src/services/firebaseAdmin.js
import { initializeApp, cert } from "firebase-admin/app";
import { getMessaging } from "firebase-admin/messaging";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH || 
  path.join(__dirname, "../../config/firebase-service-account.json");

// Initialize Firebase Admin
const app = initializeApp({
  credential: cert(serviceAccountPath)
});

const messaging = getMessaging(app);

/**
 * Send notification to a specific device
 * @param {string} token - FCM device token
 * @param {object} notification - Notification payload
 * @returns {Promise}
 */
export const sendNotification = async (token, notification) => {
  try {
    const message = {
      token,
      notification: {
        title: notification.title,
        body: notification.body
      },
      data: notification.data || {}
    };
    
    const response = await messaging.send(message);
    console.log("Successfully sent notification:", response);
    return response;
  } catch (error) {
    console.error("Error sending notification:", error);
    throw error;
  }
};

/**
 * Send notification to multiple devices
 * @param {string[]} tokens - Array of FCM device tokens
 * @param {object} notification - Notification payload
 * @returns {Promise}
 */
export const sendMulticastNotification = async (tokens, notification) => {
  try {
    const message = {
      tokens,
      notification: {
        title: notification.title,
        body: notification.body
      },
      data: notification.data || {}
    };
    
    const response = await messaging.sendMulticast(message);
    console.log(`${response.successCount} notifications sent successfully`);
    return response;
  } catch (error) {
    console.error("Error sending multicast notification:", error);
    throw error;
  }
};
```

### Création d'un Endpoint pour Enregistrer les Tokens

```javascript
// src/routes/notifications.js
import { Hono } from "hono";

const notificationsRouter = new Hono();

// Register device token
notificationsRouter.post("/register", async (c) => {
  try {
    const { token, userId } = await c.req.json();
    
    // TODO: Store token in database associated with user
    // This could be in a new table called device_tokens
    
    return c.json({ success: true, message: "Token registered successfully" });
  } catch (error) {
    console.error("Error registering token:", error);
    return c.json({ success: false, message: "Failed to register token" }, 500);
  }
});

export default notificationsRouter;
```

### Intégration dans le Fichier des Routes Principal

```javascript
// src/routes/index.js
import { Hono } from "hono";
import clientsRouter from "./clients.js";
import serviceRequestsRouter from "./serviceRequests.js";
import techniciansRouter from "./technicians.js";
import technicianApplicationsRouter from "./technicianApplications.js";
import notificationsRouter from "./notifications.js";

const apiRouter = new Hono();

apiRouter.route("/clients", clientsRouter);
apiRouter.route("/service-requests", serviceRequestsRouter);
apiRouter.route("/technicians", techniciansRouter);
apiRouter.route("/technician-applications", technicianApplicationsRouter);
apiRouter.route("/notifications", notificationsRouter);

export default apiRouter;
```

### Création d'un Service de Notification dans le Backend

```javascript
// src/services/notificationService.js
import { sendNotification, sendMulticastNotification } from "./firebaseAdmin.js";

/**
 * Send a service request status update notification
 * @param {object} serviceRequest - The service request object
 * @param {string} status - The new status
 * @returns {Promise}
 */
export const sendServiceStatusNotification = async (serviceRequest, status) => {
  try {
    // Get client's device tokens from database
    // This is a placeholder - implement actual database query
    const tokens = await getClientDeviceTokens(serviceRequest.client_id);
    
    if (!tokens.length) return null;
    
    const statusMessages = {
      "pending": "Votre demande de service a été reçue et est en attente de traitement.",
      "assigned": "Un technicien a été assigné à votre demande de service.",
      "in_progress": "Votre réparation est en cours.",
      "completed": "Votre réparation est terminée!",
      "cancelled": "Votre demande de service a été annulée."
    };
    
    const notification = {
      title: "Mise à jour de votre demande de service",
      body: statusMessages[status] || `Le statut de votre demande est maintenant: ${status}`,
      data: {
        type: "service_update",
        serviceRequestId: serviceRequest.request_id.toString(),
        status
      }
    };
    
    return await sendMulticastNotification(tokens, notification);
  } catch (error) {
    console.error("Error sending service status notification:", error);
    throw error;
  }
};

/**
 * Get client's device tokens from database
 * @param {number} clientId - The client ID
 * @returns {Promise<string[]>} Array of device tokens
 */
async function getClientDeviceTokens(clientId) {
  // TODO: Implement database query to get client's device tokens
  // This is a placeholder
  return [];
}
```

### Mise à Jour du Modèle de Base de Données

Ajouter une nouvelle migration pour la table des tokens d'appareil:

```javascript
// src/db/migrations/006_device_tokens.js
/**
 * Create device_tokens table
 * @param {sqlite.Database} db - The database connection
 */
export async function up(db) {
  await db.exec(`
    CREATE TABLE IF NOT EXISTS device_tokens (
      token_id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      user_type TEXT NOT NULL, -- 'client', 'technician', 'admin'
      token TEXT NOT NULL UNIQUE,
      device_info TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      last_used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES clients(client_id) ON DELETE CASCADE
    )
  `);
}

/**
 * Drop device_tokens table
 * @param {sqlite.Database} db - The database connection
 */
export async function down(db) {
  await db.exec('DROP TABLE IF EXISTS device_tokens');
}
```

### Mise à Jour du Fichier .env.example

```
# Backend .env.example
PORT=8000
DATABASE_URL=./data/mydb.db
FIREBASE_SERVICE_ACCOUNT_PATH=./config/firebase-service-account.json

# Frontend .env.example
VITE_API_URL=http://localhost:8000/api
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
VITE_FIREBASE_APP_ID=your-app-id
VITE_FIREBASE_MEASUREMENT_ID=your-measurement-id
VITE_FIREBASE_VAPID_KEY=your-vapid-key
```

## Prochaines Étapes

1. Créer un projet Firebase dans la console Firebase
2. Configurer Firebase Cloud Messaging
3. Générer les fichiers de configuration et les clés nécessaires
4. Implémenter les services de notification dans le frontend et le backend
5. Tester les notifications sur différents appareils

## Ressources Utiles

- [Documentation Firebase](https://firebase.google.com/docs)
- [Firebase Cloud Messaging](https://firebase.google.com/docs/cloud-messaging)
- [React et Firebase](https://firebase.google.com/docs/web/setup)
- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)
- [Hono Framework](https://hono.dev/)
- [Shadcn UI](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/)