/**
 * Configuration pour l'API de l'application Industria
 */
export const API_CONFIG = {
  // URL de base de l'API - valeur par du00e9faut pour le du00e9veloppement
  BASE_URL: 'http://localhost:3001/api',
  
  // Activer les données fictives en cas d'erreur ou de développement
  ENABLE_MOCK: true,
  
  // En-têtes par défaut pour les requêtes
  HEADERS: {
    'Accept': 'application/json'
  },
  
  // Points d'accès de l'API
  ENDPOINTS: {
    // Données des capteurs
    SENSOR_DATA: '/sensors/data',
    HISTORICAL_DATA: '/sensors/historical',
    
    // Machines
    MACHINES: '/machines',
    MACHINE_STATUS: '/machines/status',
    
    // Modèle de ML
    ML_MODEL: '/ml/status',
    ML_TRAIN: '/ml/train',
    ML_PREDICT: '/ml/predict',
    
    // Import/Export de données
    IMPORT_DATA: '/data/import',
    EXPORT_DATA: '/data/export'
  },
  
  // Options pour les requêtes
  REQUEST_OPTIONS: {
    timeout: 30000 // 30 secondes
  },
  
  // Intervalles de rafraîchissement (en millisecondes)
  REFRESH_INTERVALS: {
    REAL_TIME: 5000,       // 5 secondes pour les données en temps réel
    MACHINE_STATUS: 10000, // 10 secondes pour le statut des machines
    ML_METRICS: 30000     // 30 secondes pour les métriques du modèle ML
  }
};
