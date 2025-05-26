/**
 * Service pour récupérer les données des capteurs
 */

import { ApiClient } from './apiClient';
import { API_CONFIG } from '@/config/api.config';
import { SensorData } from '@/types/prediction';

/**
 * Interface explicite pour les données de capteur
 * À placer dans @/types/prediction.ts si ce n'est pas déjà fait !
 */
// export interface SensorData {
//   temperature: number;
//   pressure: number;
//   vibration: number;
//   rotation: number;
//   current: number;
//   voltage: number;
// }

/**
 * Interface pour les données de capteur avec timestamp
 */
export interface TimestampedSensorData {
  timestamp: string;
  machine: string;
  temperature: number;
  pressure: number;
  vibration: number;
  rotation: number;
  current: number;
  voltage: number;
}

/**
 * Service pour la gestion des données de capteurs
 */
export class SensorDataService {
  /**
   * Récupère les données en temps réel des capteurs
   * @param machineId - ID de la machine (optionnel)
   * @returns Données des capteurs en temps réel
   */
  static async getRealTimeData(machineId?: string): Promise<TimestampedSensorData[]> {
    try {
      const params: Record<string, any> = {};
      if (machineId) {
        params.machineId = machineId;
      }

      return await ApiClient.get<TimestampedSensorData[]>(
        API_CONFIG.ENDPOINTS.SENSOR_DATA,
        params
      );
    } catch (error) {
      console.error('Erreur lors de la récupération des données en temps réel :', error);
      // En cas d'erreur, retourner des données simulées
      return this.getFallbackData(1, machineId);
    }
  }

  /**
   * Récupère les données historiques des capteurs
   * @param startDate - Date de début
   * @param endDate - Date de fin
   * @param machineId - ID de la machine (optionnel)
   * @returns Données historiques des capteurs
   */
  static async getHistoricalData(
    startDate: Date,
    endDate: Date,
    machineId?: string
  ): Promise<TimestampedSensorData[]> {
    try {
      const params: Record<string, any> = {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      };

      if (machineId) {
        params.machineId = machineId;
      }

      return await ApiClient.get<TimestampedSensorData[]>(
        API_CONFIG.ENDPOINTS.HISTORICAL_DATA,
        params
      );
    } catch (error) {
      console.error('Erreur lors de la récupération des données historiques :', error);
      // En cas d'erreur, retourner des données simulées
      return this.getFallbackData(100, machineId);
    }
  }

  /**
   * Génère des données de secours en cas d'erreur API
   * @param count - Nombre de points de données à générer
   * @param machineId - ID de la machine (optionnel)
   * @returns Données simulées
   */
  static getFallbackData(count: number, machineId?: string): TimestampedSensorData[] {
    const data: TimestampedSensorData[] = [];
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
}