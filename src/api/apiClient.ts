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
  static async get<T>(endpoint: string, params: Record<string, string | number | boolean> = {}): Promise<T> {
    try {
      // Construire l'URL avec les paramètres
      const url = new URL(endpoint, API_CONFIG.BASE_URL);
      
      // Ajouter les paramètres de requête s'il y en a
      Object.keys(params).forEach(key => {
        url.searchParams.append(key, String(params[key]));
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
  static async post<T, D = Record<string, unknown>>(endpoint: string, data: D): Promise<T> {
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
  private static mockDataHandlers: Record<string, (params?: Record<string, string | number | boolean>) => unknown> = {
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
      const startDate = params?.startDate ? new Date(String(params.startDate)) : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const endDate = params?.endDate ? new Date(String(params.endDate)) : new Date();
      
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
  private static mockPostHandlers: Record<string, (data: Record<string, unknown>) => unknown> = {
    // Entraînement du modèle ML
    [API_CONFIG.ENDPOINTS.ML_TRAIN]: (data) => {
      console.log('Simulation d\'entraînement du modèle avec', Array.isArray(data) ? data.length : 0, 'points de données');
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
        machine: (data as Record<string, unknown>).machine || `Machine ${Math.floor(Math.random() * 5) + 1}`,
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
      const length = Array.isArray(data) ? data.length : 0;
      return {
        success: true,
        message: `${length} points de données importés avec succès`,
        count: length
      };
    }
  };

  // Implémenter les méthodes pour générer des données fictives
  private static generateSensorData(count: number, machineId?: string): Array<Record<string, string | number>> {
    const data = [];
    const machines = ['Machine 1', 'Machine 2', 'Machine 3', 'Machine 4', 'Machine 5'];
    const selectedMachine = machineId ? `Machine ${machineId}` : null;

    // Définir des plages normales pour chaque type de machine
    const machineProfiles = {
      'Machine 1': { // Machine plus ancienne, plus de variations
        temperature: { base: 72, variation: 8, drift: 0.05 },
        pressure: { base: 2.2, variation: 0.4, drift: 0.01 },
        vibration: { base: 0.7, variation: 0.3, drift: 0.005 },
        rotation: { base: 1050, variation: 100, drift: 0.2 },
        current: { base: 12, variation: 2.5, drift: 0.02 },
        voltage: { base: 225, variation: 15, drift: 0.1 }
      },
      'Machine 2': { // Machine moderne, stable
        temperature: { base: 65, variation: 5, drift: 0.02 },
        pressure: { base: 2.0, variation: 0.2, drift: 0.005 },
        vibration: { base: 0.4, variation: 0.15, drift: 0.002 },
        rotation: { base: 1200, variation: 50, drift: 0.1 },
        current: { base: 10, variation: 1.5, drift: 0.01 },
        voltage: { base: 230, variation: 8, drift: 0.05 }
      },
      'Machine 3': { // Machine haute performance
        temperature: { base: 80, variation: 7, drift: 0.04 },
        pressure: { base: 2.8, variation: 0.3, drift: 0.008 },
        vibration: { base: 0.5, variation: 0.2, drift: 0.003 },
        rotation: { base: 1500, variation: 80, drift: 0.15 },
        current: { base: 15, variation: 2, drift: 0.015 },
        voltage: { base: 240, variation: 10, drift: 0.08 }
      },
      'Machine 4': { // Machine économique
        temperature: { base: 60, variation: 6, drift: 0.03 },
        pressure: { base: 1.8, variation: 0.25, drift: 0.007 },
        vibration: { base: 0.6, variation: 0.25, drift: 0.004 },
        rotation: { base: 950, variation: 70, drift: 0.12 },
        current: { base: 9, variation: 1.8, drift: 0.018 },
        voltage: { base: 220, variation: 12, drift: 0.09 }
      },
      'Machine 5': { // Machine industrielle lourde
        temperature: { base: 75, variation: 10, drift: 0.06 },
        pressure: { base: 3.0, variation: 0.5, drift: 0.012 },
        vibration: { base: 0.8, variation: 0.35, drift: 0.006 },
        rotation: { base: 900, variation: 120, drift: 0.25 },
        current: { base: 18, variation: 3, drift: 0.025 },
        voltage: { base: 235, variation: 18, drift: 0.12 }
      }
    };

    // Générer des données avec des tendances et des cycles
    for (let i = 0; i < count; i++) {
      const date = new Date();
      date.setMinutes(date.getMinutes() - i * 5); // Données espacées de 5 minutes
      
      // Sélectionner une machine
      const machineName = selectedMachine || machines[Math.floor(Math.random() * machines.length)];
      const profile = machineProfiles[machineName];
      
      // Facteurs cycliques (simule les cycles de travail, variations jour/nuit, etc.)
      const hourOfDay = date.getHours();
      const dayFactor = Math.sin((hourOfDay - 6) * Math.PI / 12); // Pic à midi, creux à minuit
      
      // Facteur de charge (simule les périodes de forte/faible activité)
      const loadFactor = 0.8 + 0.2 * Math.sin(i * 0.05);
      
      // Introduire des anomalies occasionnelles (environ 5% du temps)
      const hasAnomaly = Math.random() < 0.05;
      const anomalyFactor = hasAnomaly ? 1.5 + Math.random() * 0.5 : 1.0;
      
      // Calculer les valeurs avec tous les facteurs
      const getValue = (param: {base: number, variation: number, drift: number}) => {
        const trend = param.drift * i; // Dérive progressive
        const cycle = dayFactor * param.variation * 0.3; // Variation cyclique
        const load = (loadFactor - 1) * param.variation * 0.4; // Effet de la charge
        const noise = (Math.random() - 0.5) * param.variation * 0.6; // Bruit aléatoire
        const anomaly = hasAnomaly ? (anomalyFactor - 1) * param.variation : 0; // Anomalie
        
        return param.base + trend + cycle + load + noise + anomaly;
      };
      
      data.push({
        timestamp: date.toISOString(),
        machine: machineName,
        temperature: getValue(profile.temperature),
        pressure: getValue(profile.pressure),
        vibration: getValue(profile.vibration),
        rotation: getValue(profile.rotation),
        current: getValue(profile.current),
        voltage: getValue(profile.voltage)
      });
    }

    return data;
  }

  private static generateHistoricalData(count: number, startDate: Date, endDate: Date, machineId?: string): Array<Record<string, string | number | boolean | Record<string, string | number | boolean>>> {
    const data = [];
    const machines = ['Machine 1', 'Machine 2', 'Machine 3', 'Machine 4', 'Machine 5'];
    const selectedMachine = machineId ? `Machine ${machineId}` : null;
    
    // Définir des plages normales pour chaque type de machine (mêmes profils que generateSensorData)
    const machineProfiles = {
      'Machine 1': { // Machine plus ancienne, plus de variations
        temperature: { base: 72, variation: 8, drift: 0.05 },
        pressure: { base: 2.2, variation: 0.4, drift: 0.01 },
        vibration: { base: 0.7, variation: 0.3, drift: 0.005 },
        rotation: { base: 1050, variation: 100, drift: 0.2 },
        current: { base: 12, variation: 2.5, drift: 0.02 },
        voltage: { base: 225, variation: 15, drift: 0.1 }
      },
      'Machine 2': { // Machine moderne, stable
        temperature: { base: 65, variation: 5, drift: 0.02 },
        pressure: { base: 2.0, variation: 0.2, drift: 0.005 },
        vibration: { base: 0.4, variation: 0.15, drift: 0.002 },
        rotation: { base: 1200, variation: 50, drift: 0.1 },
        current: { base: 10, variation: 1.5, drift: 0.01 },
        voltage: { base: 230, variation: 8, drift: 0.05 }
      },
      'Machine 3': { // Machine haute performance
        temperature: { base: 80, variation: 7, drift: 0.04 },
        pressure: { base: 2.8, variation: 0.3, drift: 0.008 },
        vibration: { base: 0.5, variation: 0.2, drift: 0.003 },
        rotation: { base: 1500, variation: 80, drift: 0.15 },
        current: { base: 15, variation: 2, drift: 0.015 },
        voltage: { base: 240, variation: 10, drift: 0.08 }
      },
      'Machine 4': { // Machine économique
        temperature: { base: 60, variation: 6, drift: 0.03 },
        pressure: { base: 1.8, variation: 0.25, drift: 0.007 },
        vibration: { base: 0.6, variation: 0.25, drift: 0.004 },
        rotation: { base: 950, variation: 70, drift: 0.12 },
        current: { base: 9, variation: 1.8, drift: 0.018 },
        voltage: { base: 220, variation: 12, drift: 0.09 }
      },
      'Machine 5': { // Machine industrielle lourde
        temperature: { base: 75, variation: 10, drift: 0.06 },
        pressure: { base: 3.0, variation: 0.5, drift: 0.012 },
        vibration: { base: 0.8, variation: 0.35, drift: 0.006 },
        rotation: { base: 900, variation: 120, drift: 0.25 },
        current: { base: 18, variation: 3, drift: 0.025 },
        voltage: { base: 235, variation: 18, drift: 0.12 }
      }
    };
    
    // Calculer l'intervalle entre les points de données
    const timeSpan = endDate.getTime() - startDate.getTime();
    const interval = timeSpan / count;

    // Simuler des événements majeurs (maintenance, pannes, etc.)
    const events = [];
    const numEvents = Math.floor(count / 50) + 1; // Environ un événement tous les 50 points
    
    for (let e = 0; e < numEvents; e++) {
      events.push({
        index: Math.floor(Math.random() * count),
        duration: Math.floor(Math.random() * 10) + 1, // Durée de 1 à 10 points
        type: Math.random() < 0.7 ? 'maintenance' : 'panne', // 70% maintenance, 30% panne
        intensity: 0.5 + Math.random() * 1.5 // Facteur d'intensité
      });
    }

    // Générer une tendance globale (usure progressive, amélioration après maintenance, etc.)
    const globalTrend = {
      direction: Math.random() < 0.7 ? 1 : -1, // 70% dégradation, 30% amélioration
      intensity: 0.1 + Math.random() * 0.3 // Intensité de la tendance
    };

    for (let i = 0; i < count; i++) {
      const date = new Date(startDate.getTime() + interval * i);
      const machineName = selectedMachine || machines[Math.floor(Math.random() * machines.length)];
      const profile = machineProfiles[machineName];
      
      // Facteurs temporels
      const timeProgress = i / count; // Progression dans la période (0 à 1)
      const hourOfDay = date.getHours();
      const dayOfWeek = date.getDay(); // 0 = dimanche, 6 = samedi
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      
      // Facteur jour/nuit (charge plus élevée pendant les heures de travail)
      const dayFactor = isWeekend ? 0.7 : Math.sin((hourOfDay - 6) * Math.PI / 12) * 0.5 + 0.5;
      
      // Vérifier si un événement est actif à ce point
      let eventFactor = 1.0;
      let eventType = null;
      
      for (const event of events) {
        if (i >= event.index && i < event.index + event.duration) {
          eventType = event.type;
          if (event.type === 'maintenance') {
            // Pendant la maintenance: valeurs plus stables, mais machine moins productive
            eventFactor = 0.5;
          } else if (event.type === 'panne') {
            // Pendant une panne: valeurs anormales
            eventFactor = event.intensity;
          }
          break;
        }
      }
      
      // Calculer les valeurs avec tous les facteurs
      const getValue = (param: {base: number, variation: number, drift: number}) => {
        // Tendance globale (usure progressive)
        const trend = param.drift * i * globalTrend.direction * globalTrend.intensity;
        
        // Variation cyclique (jour/nuit, semaine/weekend)
        const cycle = dayFactor * param.variation * 0.3;
        
        // Bruit aléatoire (variations normales)
        const noise = (Math.random() - 0.5) * param.variation * 0.4;
        
        // Effet des événements (maintenance, panne)
        let eventEffect = 0;
        if (eventType === 'maintenance') {
          // Pendant la maintenance: valeurs plus stables
          eventEffect = -param.variation * 0.3;
        } else if (eventType === 'panne') {
          // Pendant une panne: valeurs anormales
          eventEffect = param.variation * eventFactor;
        }
        
        return param.base + trend + cycle + noise + eventEffect;
      };
      
      // Générer des données avec des tendances réalistes
      data.push({
        timestamp: date.toISOString(),
        machine: machineName,
        temperature: getValue(profile.temperature),
        pressure: getValue(profile.pressure),
        vibration: getValue(profile.vibration),
        rotation: getValue(profile.rotation),
        current: getValue(profile.current),
        voltage: getValue(profile.voltage),
        // Ajouter des métadonnées pour l'analyse
        metadata: {
          eventType: eventType,
          dayFactor: dayFactor,
          isWeekend: isWeekend
        }
      });
    }

    return data;
  }

  private static generateMachineStatus(): Array<Record<string, string | number | Record<string, number>>> {
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

  private static generateMachines(): Array<Record<string, string>> {
    return [
      { id: 'machine-1', name: 'Machine 1', type: 'Pompe centrifuge', location: 'Zone A' },
      { id: 'machine-2', name: 'Machine 2', type: 'Compresseur', location: 'Zone B' },
      { id: 'machine-3', name: 'Machine 3', type: 'Moteur électrique', location: 'Zone A' },
      { id: 'machine-4', name: 'Machine 4', type: 'Ventilateur industriel', location: 'Zone C' },
      { id: 'machine-5', name: 'Machine 5', type: 'Convoyeur', location: 'Zone B' }
    ];
  }

  private static generateMLModelStatus(): Record<string, boolean | number | Date | undefined | Record<string, number>> {
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