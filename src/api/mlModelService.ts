import { ApiClient } from './apiClient';
import { API_CONFIG } from '@/config/api.config';
import { MLModelStatus } from '@/types/prediction';
import { TimestampedSensorData } from '@/api/sensorDataService';

/**
 * Service pour l'interaction avec le modèle de machine learning
 */
export class MLModelService {
  /**
   * Récupère l'état actuel du modèle ML
   * @returns Statut du modèle ML
   */
  static async getModelStatus(): Promise<MLModelStatus> {
    try {
      return await ApiClient.get<MLModelStatus>(API_CONFIG.ENDPOINTS.ML_MODEL);
    } catch (error) {
      console.error('Erreur lors de la récupération du statut du modèle:', error);
      // En cas d'erreur, retourner un statut par défaut
      return this.getDefaultModelStatus();
    }
  }

  /**
   * Entraîne le modèle ML avec les données fournis
   * @param data - Données d'entraînement (optionnel)
   * @returns Statut du modèle après entraînement
   */
  static async trainModel(data?: unknown[]): Promise<MLModelStatus> {
    try {
      // Si aucune donnée n'est fournie, entraîner avec les données existantes sur le serveur
      if (!data) {
        return await ApiClient.post<MLModelStatus>(API_CONFIG.ENDPOINTS.ML_TRAIN, {});
      }
      
      // Sinon, entraîner avec les données fournies
      return await ApiClient.post<MLModelStatus>(API_CONFIG.ENDPOINTS.ML_TRAIN, { data });
    } catch (error) {
      console.error('Erreur lors de l\'entraînement du modèle:', error);
      throw error;
    }
  }

  /**
   * Effectue une prédiction d'anomalie sur des données de capteur
   * @param sensorData - Données de capteur
   * @returns Résultat de la prédiction
   */
  static async predictAnomaly(sensorData: TimestampedSensorData): Promise<unknown> {
    try {
      return await ApiClient.post(API_CONFIG.ENDPOINTS.ML_PREDICT, sensorData);
    } catch (error) {
      console.error('Erreur lors de la prédiction d\'anomalie:', error);
      throw error;
    }
  }

  /**
   * Retourne un statut par défaut pour le modèle ML
   * @returns Statut par défaut
   */
  private static getDefaultModelStatus(): MLModelStatus {
    return {
      isTraining: false,
      lastTrained: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 jours avant
      accuracy: 0.85,
      precision: 0.82,
      recall: 0.79,
      f1Score: 0.80,
      parameters: {
        epochs: 10,
        batchSize: 32,
        learningRate: 0.001,
        hiddenLayers: 2,
        hiddenUnits: 64,
        dropoutRate: 0.2
      }
    };
  }
}