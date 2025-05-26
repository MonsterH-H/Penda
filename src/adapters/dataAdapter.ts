/**
 * Adaptateur pour la manipulation des données des capteurs
 */

import { TimestampedSensorData } from '@/api/sensorDataService';

/**
 * Options pour le traitement des données
 */
export interface DataProcessingOptions {
  normalization?: boolean;
  outlierDetection?: boolean;
  smoothing?: boolean;
  smoothingWindow?: number;
}

/**
 * Classe adaptateur pour la manipulation des données des capteurs
 */
export class DataAdapter {
  /**
   * Récupère les données de statut des machines
   * @returns Données de statut des machines
   */
  static getMachineStatusData(): Promise<any[]> {
    // Simulation de données pour la démo - dans un cas réel, cela appellerait un service API
    const statuses: Array<'online' | 'offline' | 'warning' | 'maintenance'> = ['online', 'warning', 'offline', 'maintenance'];

    return Promise.resolve(
      Array.from({ length: 8 }, (_, i) => {
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
          id: `machine-${i + 1}`,
          name: `Machine ${i + 1}`,
          status: statuses[statusIndex],
          lastUpdate: new Date(),
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
      })
    );
  }

  /**
   * Sauvegarde une prédiction d'anomalie dans le stockage local
   * @param prediction - Prédiction à sauvegarder
   */
  static savePrediction(prediction: any): void {
    const storedPredictions = this.getStoredPredictions();
    const updatedPredictions = [prediction, ...storedPredictions];
    
    // Limiter le nombre de prédictions stockées à 100 pour éviter de surcharger le stockage local
    const limitedPredictions = updatedPredictions.slice(0, 100);
    
    localStorage.setItem('penda_predictions', JSON.stringify(limitedPredictions));
  }

  /**
   * Récupère les prédictions stockées dans le stockage local
   * @returns Prédictions stockées
   */
  static getStoredPredictions(): any[] {
    try {
      const stored = localStorage.getItem('penda_predictions');
      if (!stored) return [];
      
      return JSON.parse(stored);
    } catch (error) {
      console.error('Erreur lors de la récupération des prédictions stockées:', error);
      return [];
    }
  }

  /**
   * Traite un ensemble de données en appliquant des transformations
   * @param data - Données brutes
   * @param options - Options de traitement
   * @returns Données traitées
   */
  static processData(
    data: TimestampedSensorData[],
    options: DataProcessingOptions = {}
  ): TimestampedSensorData[] {
    let processedData = [...data];
    
    // Trier les données par ordre chronologique
    processedData.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    
    // Détection des valeurs aberrantes
    if (options.outlierDetection) {
      processedData = this.removeOutliers(processedData);
    }
    
    // Normalisation des données
    if (options.normalization) {
      processedData = this.normalizeData(processedData);
    }
    
    // Lissage des données
    if (options.smoothing) {
      const window = options.smoothingWindow || 3;
      processedData = this.smoothData(processedData, window);
    }
    
    return processedData;
  }
  
  /**
   * Regroupe les données par période de temps
   * @param data - Données à regrouper
   * @param interval - Intervalle de temps en millisecondes
   * @returns Données regroupées
   */
  static aggregateByTime(
    data: TimestampedSensorData[],
    interval: number
  ): TimestampedSensorData[] {
    const groups: Record<string, TimestampedSensorData[]> = {};
    
    // Regrouper les données par intervalle de temps
    data.forEach(item => {
      const timestamp = new Date(item.timestamp).getTime();
      const groupKey = Math.floor(timestamp / interval) * interval;
      
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      
      groups[groupKey].push(item);
    });
    
    // Calculer les moyennes pour chaque groupe
    return Object.entries(groups).map(([key, items]) => {
      const timestamp = new Date(parseInt(key)).toISOString();
      const machine = items[0].machine;
      
      // Calculer la moyenne pour chaque métrique
      const metrics = [
        'temperature', 'pressure', 'vibration', 
        'rotation', 'current', 'voltage'
      ];
      
      const aggregated: Record<string, number> = {};
      
      metrics.forEach(metric => {
        aggregated[metric] = items.reduce((sum, item) => sum + (item[metric as keyof typeof item] as number), 0) / items.length;
      });
      
      return {
        timestamp,
        machine,
        temperature: aggregated.temperature,
        pressure: aggregated.pressure,
        vibration: aggregated.vibration,
        rotation: aggregated.rotation,
        current: aggregated.current,
        voltage: aggregated.voltage
      };
    });
  }
  
  /**
   * Filtre les données par machine
   * @param data - Données à filtrer
   * @param machineId - Identifiant de la machine
   * @returns Données filtrées
   */
  static filterByMachine(
    data: TimestampedSensorData[],
    machineId: string
  ): TimestampedSensorData[] {
    return data.filter(item => item.machine === machineId);
  }
  
  /**
   * Détecte et supprime les valeurs aberrantes
   * @param data - Données à traiter
   * @returns Données sans valeurs aberrantes
   */
  private static removeOutliers(data: TimestampedSensorData[]): TimestampedSensorData[] {
    // Méthode simple basée sur l'écart-type (méthode z-score)
    const metrics = ['temperature', 'pressure', 'vibration', 'rotation', 'current', 'voltage'];
    
    // Calculer la moyenne et l'écart-type pour chaque métrique
    const stats: Record<string, { mean: number; std: number }> = {};
    
    metrics.forEach(metric => {
      const values = data.map(item => item[metric as keyof typeof item] as number);
      const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
      const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
      const variance = squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length;
      const std = Math.sqrt(variance);
      
      stats[metric] = { mean, std };
    });
    
    // Filtrer les valeurs qui sont à plus de 3 écarts-types de la moyenne
    return data.filter(item => {
      for (const metric of metrics) {
        const value = item[metric as keyof typeof item] as number;
        const { mean, std } = stats[metric];
        
        if (Math.abs(value - mean) > 3 * std) {
          return false;
        }
      }
      
      return true;
    });
  }
  
  /**
   * Normalise les données sur une échelle [0, 1]
   * @param data - Données à normaliser
   * @returns Données normalisées
   */
  private static normalizeData(data: TimestampedSensorData[]): TimestampedSensorData[] {
    const metrics = ['temperature', 'pressure', 'vibration', 'rotation', 'current', 'voltage'];
    
    // Trouver les valeurs min et max pour chaque métrique
    const ranges: Record<string, { min: number; max: number }> = {};
    
    metrics.forEach(metric => {
      const values = data.map(item => item[metric as keyof typeof item] as number);
      const min = Math.min(...values);
      const max = Math.max(...values);
      
      ranges[metric] = { min, max };
    });
    
    // Normaliser les données
    return data.map(item => {
      const normalized: Record<string, any> = {
        timestamp: item.timestamp,
        machine: item.machine
      };
      
      metrics.forEach(metric => {
        const value = item[metric as keyof typeof item] as number;
        const { min, max } = ranges[metric];
        
        // Éviter la division par zéro
        normalized[metric] = max > min 
          ? (value - min) / (max - min)
          : 0;
      });
      
      return normalized as TimestampedSensorData;
    });
  }
  
  /**
   * Lisse les données en utilisant une moyenne mobile
   * @param data - Données à lisser
   * @param windowSize - Taille de la fenêtre de lissage
   * @returns Données lissées
   */
  private static smoothData(
    data: TimestampedSensorData[], 
    windowSize: number
  ): TimestampedSensorData[] {
    // S'il n'y a pas assez de données pour le lissage, retourner les données originales
    if (data.length < windowSize) {
      return [...data];
    }
    
    const metrics = ['temperature', 'pressure', 'vibration', 'rotation', 'current', 'voltage'];
    const result: TimestampedSensorData[] = [];
    
    for (let i = 0; i < data.length; i++) {
      const smoothed: Record<string, any> = {
        timestamp: data[i].timestamp,
        machine: data[i].machine
      };
      
      metrics.forEach(metric => {
        // Calculer la moyenne mobile pour cette métrique
        let sum = 0;
        let count = 0;
        
        for (let j = Math.max(0, i - Math.floor(windowSize / 2)); j <= Math.min(data.length - 1, i + Math.floor(windowSize / 2)); j++) {
          sum += data[j][metric as keyof typeof data[0]] as number;
          count++;
        }
        
        smoothed[metric] = sum / count;
      });
      
      result.push(smoothed as TimestampedSensorData);
    }
    
    return result;
  }
}
