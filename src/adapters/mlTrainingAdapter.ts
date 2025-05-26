/**
 * Adaptateur pour l'entraînement du modèle ML
 */

import { MLModelService } from '@/api/mlModelService';
import { TimestampedSensorData } from '@/api/sensorDataService';
import { AnomalyPrediction, MLModelStatus } from '@/types/prediction';

/**
 * Options de configuration pour l'entraînement du modèle
 */
export interface TrainingOptions {
  // Pourcentage de données à utiliser pour l'entraînement (vs validation)
  trainingRatio?: number;
  // Nombre d'époques pour l'entraînement
  epochs?: number;
  // Taille du lot pour l'entraînement
  batchSize?: number;
  // Fonction de rappel pour suivre la progression
  onProgress?: (progress: number, epoch: number, totalEpochs: number) => void;
}

/**
 * Classe adaptateur pour l'entraînement du modèle ML
 */
export class MLTrainingAdapter {
  /**
   * Prépare les données pour l'entraînement du modèle
   * @param data - Données brutes des capteurs
   * @returns Données préparées pour l'entraînement
   */
  static prepareTrainingData(data: TimestampedSensorData[]): any[] {
    // Tri des données par timestamp
    const sortedData = [...data].sort((a, b) => {
      return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
    });
    
    // Normalisation des données
    return sortedData.map(item => ({
      timestamp: item.timestamp,
      machine: item.machine,
      features: [
        this.normalize(item.temperature, 0, 100),
        this.normalize(item.pressure, 0, 5),
        this.normalize(item.vibration, 0, 2),
        this.normalize(item.rotation, 500, 2000),
        this.normalize(item.current, 0, 20),
        this.normalize(item.voltage, 180, 260)
      ]
    }));
  }
  
  /**
   * Entraîne le modèle ML avec les données fournies
   * @param data - Données pour l'entraînement
   * @param options - Options d'entraînement
   * @returns État du modèle après entraînement
   */
  static async trainModel(
    data: TimestampedSensorData[],
    options: TrainingOptions = {}
  ): Promise<MLModelStatus> {
    // Valeurs par défaut pour les options
    const {
      trainingRatio = 0.8,
      epochs = 10,
      batchSize = 32,
      onProgress
    } = options;
    
    // Préparer les données d'entraînement
    const preparedData = this.prepareTrainingData(data);
    
    try {
      // Simuler la progression de l'entraînement si une fonction de rappel est fournie
      if (onProgress) {
        // Créer un intervalle pour simuler la progression
        const interval = setInterval(() => {
          const currentEpoch = Math.floor(Math.random() * epochs) + 1;
          const progress = (currentEpoch / epochs) * 100;
          onProgress(progress, currentEpoch, epochs);
          
          if (currentEpoch >= epochs) {
            clearInterval(interval);
          }
        }, 1000);
      }
      
      // Appeler le service d'API pour entraîner le modèle
      return await MLModelService.trainModel(preparedData);
    } catch (error) {
      console.error('Erreur lors de l\'entraînement du modèle:', error);
      throw error;
    }
  }
  
  /**
   * Évalue la qualité du modèle sur des données de test
   * @param testData - Données de test
   * @returns Métriques d'évaluation
   */
  static async evaluateModel(testData: TimestampedSensorData[]): Promise<Partial<MLModelStatus>> {
    try {
      // Préparer les données de test
      const preparedData = this.prepareTrainingData(testData);
      
      // Simuler l'évaluation du modèle
      // Dans une implémentation réelle, cela appellerait l'API
      return {
        accuracy: 90 + Math.random() * 8,
        precision: 88 + Math.random() * 10,
        recall: 85 + Math.random() * 12,
        f1Score: 87 + Math.random() * 10
      };
    } catch (error) {
      console.error('Erreur lors de l\'évaluation du modèle:', error);
      throw error;
    }
  }
  
  /**
   * Prédit des anomalies sur un ensemble de données
   * @param data - Données pour la prédiction
   * @returns Prédictions d'anomalies
   */
  static async batchPredict(data: TimestampedSensorData[]): Promise<AnomalyPrediction[]> {
    try {
      const predictions: AnomalyPrediction[] = [];
      
      // Traiter chaque point de données
      for (const item of data) {
        // Appeler le service d'API pour prédire une anomalie
        const prediction = await MLModelService.predictAnomaly(item);
        predictions.push(prediction);
      }
      
      return predictions;
    } catch (error) {
      console.error('Erreur lors des prédictions par lot:', error);
      throw error;
    }
  }
  
  /**
   * Normalise une valeur dans l'intervalle [0, 1]
   * @param value - Valeur à normaliser
   * @param min - Valeur minimale attendue
   * @param max - Valeur maximale attendue
   * @returns Valeur normalisée
   */
  private static normalize(value: number, min: number, max: number): number {
    return Math.max(0, Math.min(1, (value - min) / (max - min)));
  }
}
