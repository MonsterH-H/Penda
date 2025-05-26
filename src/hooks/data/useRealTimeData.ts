import { useState, useEffect } from 'react';
import { SensorDataService, TimestampedSensorData } from '@/api/sensorDataService';

/**
 * Options pour le hook useRealTimeData
 */
export interface RealTimeDataOptions {
  refreshInterval?: number;
  machineId?: string;
  enabled?: boolean;
}

/**
 * Hook personnalisu00e9 pour ru00e9cupu00e9rer les donnu00e9es des capteurs en temps ru00e9el
 * @param options - Options de configuration
 * @returns Donnu00e9es des capteurs en temps ru00e9el, u00e9tat de chargement et erreurs
 */
export function useRealTimeData(options: RealTimeDataOptions = {}) {
  const {
    refreshInterval = 5000, // 5 secondes par du00e9faut
    machineId,
    enabled = true
  } = options;
  
  const [data, setData] = useState<TimestampedSensorData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    let isMounted = true;
    let intervalId: NodeJS.Timeout;
    
    // Fonction pour charger les donnu00e9es
    const loadData = async () => {
      if (!enabled) return;
      
      try {
        setIsLoading(true);
        const sensorData = await SensorDataService.getRealTimeData(machineId);
        
        if (isMounted) {
          setData(sensorData);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Erreur lors du chargement des donnu00e9es');
          // En cas d'erreur, utiliser les donnu00e9es de secours
          const fallbackData = SensorDataService.getFallbackData(1, machineId);
          setData(fallbackData);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    
    // Charger les donnu00e9es immu00e9diatement
    loadData();
    
    // Configurer l'intervalle de rafraichissement
    if (enabled) {
      intervalId = setInterval(loadData, refreshInterval);
    }
    
    // Nettoyer l'effet
    return () => {
      isMounted = false;
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [refreshInterval, machineId, enabled]);
  
  // Fonction pour forcer le rechargement des donnu00e9es
  const refetch = async () => {
    try {
      setIsLoading(true);
      const sensorData = await SensorDataService.getRealTimeData(machineId);
      setData(sensorData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du rechargement des donnu00e9es');
    } finally {
      setIsLoading(false);
    }
  };
  
  return { data, isLoading, error, refetch };
}
