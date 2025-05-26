import { useState, useEffect } from 'react';
import { SensorDataService, TimestampedSensorData } from '@/api/sensorDataService';

/**
 * Options pour le hook useHistoricalData
 */
export interface HistoricalDataOptions {
  startDate: Date;
  endDate: Date;
  machineId?: string;
  metrics?: string[];
  aggregation?: 'none' | 'hourly' | 'daily' | 'weekly';
  enabled?: boolean;
}

/**
 * Hook personnalisé pour récupérer les données historiques des capteurs
 * @param options - Options de configuration
 * @returns Données historiques, état de chargement et erreurs
 */
export function useHistoricalData(options: HistoricalDataOptions) {
  const {
    startDate,
    endDate,
    machineId,
    metrics = ['temperature', 'pressure', 'vibration', 'rotation', 'current', 'voltage'],
    aggregation = 'none',
    enabled = true
  } = options;
  
  const [data, setData] = useState<TimestampedSensorData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | string | null>(null);
  
  useEffect(() => {
    let isMounted = true;
    
    // Fonction pour charger les données
    const loadData = async () => {
      if (!enabled) return;
      
      // Vérifier que les dates sont valides
      if (!startDate || !endDate || startDate > endDate) {
        setError('Plage de dates invalide');
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        const historicalData = await SensorDataService.getHistoricalData(
          startDate,
          endDate,
          machineId
        );
        
        if (isMounted) {
          // Filtrer les données si nécessaire
          let processedData = historicalData;
          
          // Agréger les données si demandé
          if (aggregation !== 'none') {
            processedData = aggregateData(processedData, aggregation);
          }
          
          setData(processedData);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Erreur lors du chargement des données');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    
    // Charger les données immédiatement
    loadData();
    
    // Nettoyer l'effet
    return () => {
      isMounted = false;
    };
  }, [startDate, endDate, machineId, metrics.join(','), aggregation, enabled]);
  
  // Fonction pour agréger les données
  const aggregateData = (data: TimestampedSensorData[], method: 'hourly' | 'daily' | 'weekly'): TimestampedSensorData[] => {
    // Grouper les données par période
    const groupedData: Record<string, TimestampedSensorData[]> = {};
    
    data.forEach(item => {
      const date = new Date(item.timestamp);
      let key = '';
      
      if (method === 'hourly') {
        key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}-${date.getHours()}`;
      } else if (method === 'daily') {
        key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
      } else if (method === 'weekly') {
        // Obtenir le premier jour de la semaine (lundi)
        const day = date.getDate() - date.getDay() + (date.getDay() === 0 ? -6 : 1);
        const mondayDate = new Date(date.setDate(day));
        key = `${mondayDate.getFullYear()}-${mondayDate.getMonth()}-${mondayDate.getDate()}`;
      }
      
      if (!groupedData[key]) {
        groupedData[key] = [];
      }
      
      groupedData[key].push(item);
    });
    
    // Calculer les moyennes pour chaque groupe
    return Object.entries(groupedData).map(([key, items]) => {
      const timestamp = new Date(items[0].timestamp).toISOString();
      const machine = items[0].machine;
      
      // Calculer la moyenne pour chaque métrique
      const aggregated: Record<string, number> = {
        temperature: 0,
        pressure: 0,
        vibration: 0,
        rotation: 0,
        current: 0,
        voltage: 0
      };
      
      // Somme des valeurs
      items.forEach(item => {
        Object.keys(aggregated).forEach(metric => {
          aggregated[metric] += item[metric as keyof typeof item] as number;
        });
      });
      
      // Division par le nombre d'éléments pour obtenir la moyenne
      Object.keys(aggregated).forEach(metric => {
        aggregated[metric] /= items.length;
      });
      
      // Retourner le résultat avec le bon typage
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
  };
  
  // Fonction pour forcer le rechargement des données
  const refetch = async () => {
    try {
      setIsLoading(true);
      const historicalData = await SensorDataService.getHistoricalData(
        startDate,
        endDate,
        machineId
      );
      
      let processedData = historicalData;
      if (aggregation !== 'none') {
        processedData = aggregateData(processedData, aggregation);
      }
      
      setData(processedData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du rechargement des données');
    } finally {
      setIsLoading(false);
    }
  };
  
  return { data, isLoading, error, refetch };
}
