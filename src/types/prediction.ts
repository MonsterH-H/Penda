/**
 * Types pour les prédictions d'anomalies industrielles
 */

/**
 * Données brutes des capteurs industriels
 */
export interface SensorData {
  temperature: number;
  pressure: number;
  vibration: number;
  rotation: number;
  current: number;
  voltage: number;
  [key: string]: number; // Pour permettre des capteurs supplémentaires
}

/**
 * Niveau de sévérité d'une anomalie
 */
export type AnomalySeverity = 'low' | 'medium' | 'high' | 'critical';

/**
 * Prédiction d'anomalie
 */
export interface AnomalyPrediction {
  id: string;
  timestamp: Date;
  machine: string;
  riskScore: number; // Score de risque entre 0 et 100
  reconstructionError: number; // Erreur de reconstruction du modèle
  severity: AnomalySeverity;
  factors: string[]; // Facteurs contribuant à l'anomalie
  rawData: SensorData;
}

/**
 * État du modèle de machine learning
 */
export interface MLModelStatus {
  isTraining: boolean;
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  lastTrained: Date;
  trainingProgress?: number; // 0-100
  trainingEpoch?: number;
  totalEpochs?: number;
  estimatedTimeRemaining?: string;
}

/**
 * Statistiques des anomalies par machine
 */
export interface MachineAnomalyStats {
  machine: string;
  count: number;
  averageRiskScore: number;
  criticalCount: number;
  latestAnomaly?: Date;
}

/**
 * Filtre pour les prédictions d'anomalies
 */
export interface AnomalyFilter {
  machine?: string;
  dateFrom?: Date;
  dateTo?: Date;
  minSeverity?: AnomalySeverity;
  maxResults?: number;
}
