import { API_CONFIG } from '@/config/api.config';

/**
 * Client API pour gérer les requêtes HTTP vers l'API
 */
export class ApiClient {
  /**
   * Effectue une requête GET vers l'endpoint spécifié
   * @param endpoint L'URL de l'endpoint à appeler
   * @param params Paramètres optionnels de la requête
   * @returns Les données de la réponse
   */
  static async get<T>(endpoint: string, params: Record<string, any> = {}): Promise<T> {
    try {
      // Construire l'URL avec les paramètres
      const url = new URL(endpoint, API_CONFIG.BASE_URL);
      
      // Ajouter les paramètres de requête s'il y en a
      Object.keys(params).forEach(key => {
        url.searchParams.append(key, params[key]);
      });
      
      // Effectuer la requête
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...API_CONFIG.HEADERS
        }
      });
      
      // Vérifier si la réponse est OK
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status} - ${response.statusText}`);
      }
      
      // Parser la réponse JSON
      return await response.json();
    } catch (error) {
      console.error(`Erreur lors de la requête GET vers ${endpoint}:`, error);
      // Si en mode développement, générer des données fictives
      if (API_CONFIG.ENABLE_MOCK && ApiClient.mockDataHandlers[endpoint]) {
        console.log(`Utilisation de données fictives pour ${endpoint}`);
        return ApiClient.mockDataHandlers[endpoint](params) as T;
      }
      throw error;
    }
  }

  /**
   * Effectue une requête POST vers l'endpoint spécifié
   * @param endpoint L'URL de l'endpoint à appeler
   * @param data Les données à envoyer dans la requête
   * @returns Les données de la réponse
   */
  static async post<T>(endpoint: string, data: any): Promise<T> {
    try {
      // Construire l'URL
      const url = new URL(endpoint, API_CONFIG.BASE_URL);
      
      // Effectuer la requête
      const response = await fetch(url.toString(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...API_CONFIG.HEADERS
        },
        body: JSON.stringify(data)
      });
      
      // Vérifier si la réponse est OK
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status} - ${response.statusText}`);
      }
      
      // Parser la réponse JSON
      return await response.json();
    } catch (error) {
      console.error(`Erreur lors de la requête POST vers ${endpoint}:`, error);
      // Si en mode développement, générer des données fictives
      if (API_CONFIG.ENABLE_MOCK && ApiClient.mockPostHandlers[endpoint]) {
        console.log(`Utilisation de données fictives pour POST ${endpoint}`);
        return ApiClient.mockPostHandlers[endpoint](data) as T;
      }
      throw error;
    }
  }

  // Gestionnaires de données fictives pour les requêtes GET
  private static mockDataHandlers: Record<string, (params?: Record<string, any>) => any> = {
    // Données des capteurs en temps réel
    [API_CONFIG.ENDPOINTS.SENSOR_DATA]: (params) => {
      const count = 1;
      const machineId = params?.machineId;
      return ApiClient.generateSensorData(count, machineId);
    },
    
    // Données historiques des capteurs
    [API_CONFIG.ENDPOINTS.HISTORICAL_DATA]: (params) => {
      const count = 100;
      const machineId = params?.machineId;
      const startDate = params?.startDate ? new Date(params.startDate) : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const endDate = params?.endDate ? new Date(params.endDate) : new Date();
      
      return ApiClient.generateHistoricalData(count, startDate, endDate, machineId);
    },
    
    // Statut des machines
    [API_CONFIG.ENDPOINTS.MACHINE_STATUS]: () => {
      return ApiClient.generateMachineStatus();
    },
    
    // Informations sur les machines
    [API_CONFIG.ENDPOINTS.MACHINES]: () => {
      return ApiClient.generateMachines();
    },
    
    // Statut du modèle ML
    [API_CONFIG.ENDPOINTS.ML_MODEL]: () => {
      return ApiClient.generateMLModelStatus();
    }
  };

  // Gestionnaires de données fictives pour les requêtes POST
  private static mockPostHandlers: Record<string, (data: any) => any> = {
    // Entraînement du modèle ML
    [API_CONFIG.ENDPOINTS.ML_TRAIN]: (data) => {
      console.log('Simulation d\'entraînement du modèle avec', data?.length || 0, 'points de données');
      return {
        ...ApiClient.generateMLModelStatus(),
        isTraining: false,
        lastTrained: new Date()
      };
    },

    // Prédiction d'anomalies
    [API_CONFIG.ENDPOINTS.ML_PREDICT]: (data) => {
      const severity = ['low', 'medium', 'high', 'critical'];
      const random = Math.random();
      const severityIndex = random > 0.9 ? 3 : random > 0.7 ? 2 : random > 0.4 ? 1 : 0;
      
      return {
        id: `anomaly-${Date.now()}`,
        timestamp: new Date().toISOString(),
        machine: data.machine || `Machine ${Math.floor(Math.random() * 5) + 1}`,
        riskScore: Math.random() * 100,
        reconstructionError: Math.random() * 0.5,
        severity: severity[severityIndex],
        factors: ['Température élevée', 'Vibration anormale'],
        prediction: [Math.random(), Math.random(), Math.random()],
        rawData: data
      };
    },

    // Import de données
    [API_CONFIG.ENDPOINTS.IMPORT_DATA]: (data) => {
      console.log('Simulation d\'import de données');
      return {
        success: true,
        message: `${data?.length || 0} points de données importés avec succès`,
        count: data?.length || 0
      };
    }
  };


  // Implémenter les méthodes pour générer des données fictives
  private static generateSensorData(count: number, machineId?: string): any {
    const data = [];
    const machines = ['Machine 1', 'Machine 2', 'Machine 3', 'Machine 4', 'Machine 5'];
    const selectedMachine = machineId ? `Machine ${machineId}` : null;

    for (let i = 0; i < count; i++) {
      const date = new Date();
      date.setMinutes(date.getMinutes() - i * 5); // Données espacées de 5 minutes

      data.push({
        timestamp: date.toISOString(),
        machine: selectedMachine || machines[Math.floor(Math.random() * machines.length)],
        temperature: 65 + Math.random() * 20,
        pressure: 2.0 + Math.random() * 1.5,
        vibration: 0.5 + Math.random() * 1.0,
        rotation: 1000 + Math.random() * 500,
        current: 10 + Math.random() * 8,
        voltage: 220 + Math.random() * 40
      });
    }

    return data;
  }

  private static generateHistoricalData(count: number, startDate: Date, endDate: Date, machineId?: string): any {
    const data = [];
    const machines = ['Machine 1', 'Machine 2', 'Machine 3', 'Machine 4', 'Machine 5'];
    const selectedMachine = machineId ? `Machine ${machineId}` : null;
    
    // Calculer l'intervalle entre les points de données
    const timeSpan = endDate.getTime() - startDate.getTime();
    const interval = timeSpan / count;

    for (let i = 0; i < count; i++) {
      const date = new Date(startDate.getTime() + interval * i);
      const machineName = selectedMachine || machines[Math.floor(Math.random() * machines.length)];
      
      // Générer des valeurs avec des tendances pour rendre les données plus réalistes
      const timeProgress = i / count; // 0 au début, 1 à la fin
      const noise = Math.sin(i * 0.2) * 5; // Bruit sinusoidal
      
      data.push({
        timestamp: date.toISOString(),
        machine: machineName,
        temperature: 65 + timeProgress * 10 + noise + Math.random() * 5,
        pressure: 2.0 + timeProgress * 0.5 + Math.sin(i * 0.1) * 0.3 + Math.random() * 0.3,
        vibration: 0.5 + Math.sin(i * 0.3) * 0.3 + Math.random() * 0.2,
        rotation: 1000 + Math.cos(i * 0.05) * 200 + Math.random() * 100,
        current: 10 + timeProgress * 3 + Math.sin(i * 0.15) * 2 + Math.random() * 1,
        voltage: 220 + Math.sin(i * 0.1) * 15 + Math.random() * 5
      });
    }

    return data;
  }

  private static generateMachineStatus(): any {
    const machines = ['Machine 1', 'Machine 2', 'Machine 3', 'Machine 4', 'Machine 5'];
    const statuses = ['online', 'warning', 'offline', 'maintenance'];
    
    return machines.map((name, index) => {
      const random = Math.random();
      let statusIndex = 0; // online par défaut
      
      if (random > 0.7) statusIndex = 1; // warning
      if (random > 0.9) statusIndex = 2; // offline
      if (random > 0.95) statusIndex = 3; // maintenance
      
      // Générer une efficacité cohérente avec le statut
      let efficiency = 0;
      switch (statusIndex) {
        case 0: efficiency = 85 + Math.random() * 15; break; // online: 85-100%
        case 1: efficiency = 60 + Math.random() * 20; break; // warning: 60-80%
        case 2: efficiency = Math.random() * 10; break;      // offline: 0-10%
        case 3: efficiency = 40 + Math.random() * 30; break; // maintenance: 40-70%
      }
      
      return {
        id: `machine-${index + 1}`,
        name,
        status: statuses[statusIndex],
        lastUpdate: new Date().toISOString(),
        metrics: {
          temperature: 65 + Math.random() * 15,
          pressure: 2.0 + Math.random() * 1.0,
          vibration: 0.5 + Math.random() * 0.8,
          rotation: 1200 + Math.random() * 300,
          current: 10 + Math.random() * 5,
          voltage: 220 + Math.random() * 10,
          // Ajout des propriétés manquantes requises par MachineStatusGrid
          efficiency: efficiency,
          load: 20 + Math.random() * 70,
          uptime: Math.floor(24 + Math.random() * 720) // Entre 1 et 30 jours en heures
        }
      };
    });
  }

  private static generateMachines(): any {
    return [
      { id: 'machine-1', name: 'Machine 1', type: 'Pompe centrifuge', location: 'Zone A' },
      { id: 'machine-2', name: 'Machine 2', type: 'Compresseur', location: 'Zone B' },
      { id: 'machine-3', name: 'Machine 3', type: 'Moteur électrique', location: 'Zone A' },
      { id: 'machine-4', name: 'Machine 4', type: 'Ventilateur industriel', location: 'Zone C' },
      { id: 'machine-5', name: 'Machine 5', type: 'Convoyeur', location: 'Zone B' }
    ];
  }

  private static generateMLModelStatus(): any {
    const now = new Date();
    const lastTrained = new Date(now.getTime() - Math.random() * 1000 * 60 * 60 * 24 * 3); // Entre maintenant et 3 jours avant
    
    return {
      isTraining: Math.random() > 0.9, // 10% de chance que le modèle soit en cours d'entraînement
      accuracy: 90 + Math.random() * 8,
      precision: 88 + Math.random() * 10,
      recall: 85 + Math.random() * 12,
      f1Score: 87 + Math.random() * 10,
      lastTrained,
      trainingProgress: Math.random() > 0.9 ? Math.random() * 100 : undefined,
      parameters: {
        epochs: 50,
        batchSize: 32,
        learningRate: 0.001,
        hiddenLayers: 2,
        hiddenUnits: 64,
        dropoutRate: 0.2
      }
    };
  }
}
