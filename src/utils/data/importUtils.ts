/**
 * Utilitaires pour l'importation de donnu00e9es ru00e9elles
 */

import { FileImportAdapter } from '@/adapters/fileImportAdapter';
import { MLTrainingAdapter } from '@/adapters/mlTrainingAdapter';
import { TimestampedSensorData } from '@/api/sensorDataService';
import { MLModelService } from '@/api/mlModelService';

/**
 * Ru00e9sultat de l'importation de donnu00e9es
 */
export interface ImportResult {
  success: boolean;
  data?: TimestampedSensorData[];
  message: string;
  error?: Error;
}

/**
 * Classe d'utilitaires pour l'importation de donnu00e9es
 */
export class DataImportUtils {
  /**
   * Importe des donnu00e9es u00e0 partir d'un fichier
   * @param file - Fichier u00e0 importer
   * @returns Ru00e9sultat de l'importation
   */
  static async importDataFromFile(file: File): Promise<ImportResult> {
    try {
      // Valider le fichier
      const validation = FileImportAdapter.validateFile(file);
      if (!validation.isValid) {
        return {
          success: false,
          message: validation.message || 'Fichier invalide',
        };
      }
      
      // Importer les donnu00e9es
      const data = await FileImportAdapter.importFile(file);
      
      return {
        success: true,
        data,
        message: `${data.length} points de donnu00e9es importu00e9s avec succu00e8s.`,
      };
    } catch (error) {
      console.error('Erreur lors de l\'importation du fichier:', error);
      return {
        success: false,
        message: `Erreur lors de l'importation: ${error instanceof Error ? error.message : 'Erreur inconnue'}`,
        error: error instanceof Error ? error : new Error('Erreur inconnue'),
      };
    }
  }
  
  /**
   * Entrau00eene le modu00e8le ML avec les donnu00e9es importu00e9es
   * @param data - Donnu00e9es pour l'entrau00eenement
   * @param onProgress - Fonction de rappel pour suivre la progression
   * @returns Ru00e9sultat de l'entrau00eenement
   */
  static async trainModelWithImportedData(
    data: TimestampedSensorData[],
    onProgress?: (progress: number, epoch: number, totalEpochs: number) => void
  ): Promise<ImportResult> {
    try {
      // Vu00e9rifier que les donnu00e9es sont suffisantes
      if (data.length < 10) {
        return {
          success: false,
          message: 'Donnu00e9es insuffisantes pour l\'entrau00eenement. Au moins 10 points de donnu00e9es sont nu00e9cessaires.',
        };
      }
      
      // Entrau00eener le modu00e8le
      const modelStatus = await MLTrainingAdapter.trainModel(data, {
        trainingRatio: 0.8,
        epochs: 10,
        batchSize: 32,
        onProgress,
      });
      
      return {
        success: true,
        message: `Modu00e8le entrau00eenu00e9 avec succu00e8s. Pru00e9cision: ${modelStatus.accuracy.toFixed(2)}%`,
      };
    } catch (error) {
      console.error('Erreur lors de l\'entrau00eenement du modu00e8le:', error);
      return {
        success: false,
        message: `Erreur lors de l'entrau00eenement: ${error instanceof Error ? error.message : 'Erreur inconnue'}`,
        error: error instanceof Error ? error : new Error('Erreur inconnue'),
      };
    }
  }
  
  /**
   * Effectue des pru00e9dictions sur un ensemble de donnu00e9es
   * @param data - Donnu00e9es pour les pru00e9dictions
   * @returns Ru00e9sultat des pru00e9dictions
   */
  static async predictAnomalies(data: TimestampedSensorData[]): Promise<ImportResult> {
    try {
      // Vu00e9rifier que les donnu00e9es sont pru00e9sentes
      if (data.length === 0) {
        return {
          success: false,
          message: 'Aucune donnu00e9e fournie pour les pru00e9dictions.',
        };
      }
      
      // Effectuer des pru00e9dictions pour chaque point de donnu00e9es
      const predictions = [];
      
      for (const item of data) {
        const prediction = await MLModelService.predictAnomaly(item);
        predictions.push(prediction);
      }
      
      return {
        success: true,
        message: `${predictions.length} pru00e9dictions effectuu00e9es avec succu00e8s.`,
      };
    } catch (error) {
      console.error('Erreur lors des pru00e9dictions:', error);
      return {
        success: false,
        message: `Erreur lors des pru00e9dictions: ${error instanceof Error ? error.message : 'Erreur inconnue'}`,
        error: error instanceof Error ? error : new Error('Erreur inconnue'),
      };
    }
  }
}
