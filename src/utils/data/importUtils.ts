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
      // Vérifier que les données sont suffisantes
      if (data.length < 10) {
        return {
          success: false,
          message: 'Données insuffisantes pour l\'entraînement. Au moins 10 points de données sont nécessaires.',
        };
      }
      
      // Prétraiter les données pour détecter et gérer les valeurs aberrantes
      console.log(`Prétraitement de ${data.length} points de données pour l'entraînement...`);
      
      // Vérifier la qualité des données
      const dataQualityIssues = this.checkDataQuality(data);
      if (dataQualityIssues.length > 0) {
        console.warn('Problèmes de qualité des données détectés:', dataQualityIssues);
      }
      
      // Entraîner le modèle avec des paramètres optimisés
      console.log('Démarrage de l\'entraînement du modèle...');
      const modelStatus = await MLTrainingAdapter.trainModel(data, {
        trainingRatio: 0.8,
        epochs: 50, // Augmenter le nombre d'époques pour un meilleur apprentissage
        batchSize: 32,
        onProgress,
      });
      
      console.log('Entraînement terminé avec succès');
      console.log(`Métriques: Précision: ${modelStatus.accuracy.toFixed(2)}%, F1-Score: ${modelStatus.f1Score.toFixed(2)}%`);
      
      return {
        success: true,
        message: `Modèle entraîné avec succès. Précision: ${modelStatus.accuracy.toFixed(2)}%, F1-Score: ${modelStatus.f1Score.toFixed(2)}%`,
      };
    } catch (error) {
      console.error('Erreur lors de l\'entraînement du modèle:', error);
      return {
        success: false,
        message: `Erreur lors de l'entraînement: ${error instanceof Error ? error.message : 'Erreur inconnue'}`,
        error: error instanceof Error ? error : new Error('Erreur inconnue'),
      };
    }
  }
  
  /**
   * Vérifie la qualité des données importées
   * @param data - Données à vérifier
   * @returns Liste des problèmes détectés
   */
  private static checkDataQuality(data: TimestampedSensorData[]): string[] {
    const issues: string[] = [];
    
    // Vérifier les valeurs manquantes ou nulles
    const fieldsToCheck = ['temperature', 'pressure', 'vibration', 'rotation', 'current', 'voltage'];
    const missingValues: Record<string, number> = {};
    
    for (const field of fieldsToCheck) {
      const missing = data.filter(item => {
        const value = item[field as keyof TimestampedSensorData];
        return value === undefined || value === null || isNaN(Number(value));
      }).length;
      
      if (missing > 0) {
        missingValues[field] = missing;
        if (missing > data.length * 0.1) { // Plus de 10% de valeurs manquantes
          issues.push(`${missing} valeurs manquantes pour ${field} (${(missing / data.length * 100).toFixed(1)}%)`);
        }
      }
    }
    
    // Vérifier les doublons de timestamp pour une même machine
    const timestampMap: Record<string, Set<string>> = {};
    const duplicates: string[] = [];
    
    for (const item of data) {
      const key = item.machine;
      if (!timestampMap[key]) timestampMap[key] = new Set();
      
      if (timestampMap[key].has(item.timestamp)) {
        duplicates.push(`${item.machine} - ${item.timestamp}`);
      } else {
        timestampMap[key].add(item.timestamp);
      }
    }
    
    if (duplicates.length > 0) {
      issues.push(`${duplicates.length} doublons de timestamps détectés`);
    }
    
    // Vérifier les valeurs aberrantes
    const stats: Record<string, { min: number; max: number; sum: number; count: number }> = {};
    
    for (const field of fieldsToCheck) {
      stats[field] = { min: Infinity, max: -Infinity, sum: 0, count: 0 };
    }
    
    // Calculer les statistiques de base
    for (const item of data) {
      for (const field of fieldsToCheck) {
        const value = Number(item[field as keyof TimestampedSensorData]);
        if (!isNaN(value)) {
          stats[field].min = Math.min(stats[field].min, value);
          stats[field].max = Math.max(stats[field].max, value);
          stats[field].sum += value;
          stats[field].count++;
        }
      }
    }
    
    // Calculer les moyennes
    const means: Record<string, number> = {};
    for (const field of fieldsToCheck) {
      if (stats[field].count > 0) {
        means[field] = stats[field].sum / stats[field].count;
      }
    }
    
    // Calculer les écarts-types
    const stdDevs: Record<string, number> = {};
    for (const field of fieldsToCheck) {
      if (stats[field].count > 0) {
        let sumSquaredDiffs = 0;
        for (const item of data) {
          const value = Number(item[field as keyof TimestampedSensorData]);
          if (!isNaN(value)) {
            sumSquaredDiffs += Math.pow(value - means[field], 2);
          }
        }
        stdDevs[field] = Math.sqrt(sumSquaredDiffs / stats[field].count);
      }
    }
    
    // Détecter les valeurs aberrantes (au-delà de 3 écarts-types)
    const outliers: Record<string, number> = {};
    for (const field of fieldsToCheck) {
      if (stats[field].count > 0 && stdDevs[field] > 0) {
        let count = 0;
        for (const item of data) {
          const value = Number(item[field as keyof TimestampedSensorData]);
          if (!isNaN(value)) {
            const zScore = Math.abs((value - means[field]) / stdDevs[field]);
            if (zScore > 3) count++;
          }
        }
        if (count > 0) {
          outliers[field] = count;
          if (count > data.length * 0.05) { // Plus de 5% de valeurs aberrantes
            issues.push(`${count} valeurs aberrantes pour ${field} (${(count / data.length * 100).toFixed(1)}%)`);
          }
        }
      }
    }
    
    return issues;
  }
  
  /**
   * Effectue des pru00e9dictions sur un ensemble de donnu00e9es
   * @param data - Donnu00e9es pour les pru00e9dictions
   * @returns Ru00e9sultat des pru00e9dictions
   */
  static async predictAnomalies(data: TimestampedSensorData[]): Promise<ImportResult> {
    try {
      // Vérifier que les données sont présentes
      if (data.length === 0) {
        return {
          success: false,
          message: 'Aucune donnée fournie pour les prédictions.',
        };
      }
      
      console.log(`Prédiction d'anomalies sur ${data.length} points de données...`);
      
      // Utiliser l'adaptateur ML pour effectuer des prédictions par lot
      const predictions = await MLTrainingAdapter.batchPredict(data);
      
      // Analyser les résultats
      const anomalies = predictions.filter(p => p.severity !== 'low');
      const highSeverityCount = predictions.filter(p => p.severity === 'high').length;
      const mediumSeverityCount = predictions.filter(p => p.severity === 'medium').length;
      
      // Calculer les facteurs les plus fréquents
      const factorCounts: Record<string, number> = {};
      for (const pred of predictions) {
        for (const factor of pred.factors) {
          factorCounts[factor] = (factorCounts[factor] || 0) + 1;
        }
      }
      
      // Trier les facteurs par fréquence
      const topFactors = Object.entries(factorCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([factor, count]) => `${factor} (${count})`);
      
      const anomalyRate = (anomalies.length / predictions.length * 100).toFixed(1);
      
      let resultMessage = `${predictions.length} prédictions effectuées avec succès.`;
      
      if (anomalies.length > 0) {
        resultMessage += ` ${anomalies.length} anomalies détectées (${anomalyRate}%): `;
        resultMessage += `${highSeverityCount} critiques, ${mediumSeverityCount} moyennes.`;
        
        if (topFactors.length > 0) {
          resultMessage += ` Principaux facteurs: ${topFactors.join(', ')}.`;
        }
      } else {
        resultMessage += ` Aucune anomalie détectée.`;
      }
      
      return {
        success: true,
        message: resultMessage,
      };
    } catch (error) {
      console.error('Erreur lors des prédictions:', error);
      return {
        success: false,
        message: `Erreur lors des prédictions: ${error instanceof Error ? error.message : 'Erreur inconnue'}`,
        error: error instanceof Error ? error : new Error('Erreur inconnue'),
      };
    }
  }
}
