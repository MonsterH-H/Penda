/**
 * Hook pour la gestion du modèle ML
 */

import { useState, useEffect } from 'react';
import { MLModelService } from '@/api/mlModelService';
import { MLModelStatus } from '@/types/prediction';
import { API_CONFIG } from '@/config/api.config';

/**
 * Options pour le hook useMLModel
 */
export interface MLModelOptions {
  refreshInterval?: number;
  enabled?: boolean;
}

/**
 * Hook personnalisé pour récupérer et mettre à jour l'état du modèle ML
 * @param options - Options de configuration
 * @returns État du modèle ML
 */
export function useMLModelStatus(options: MLModelOptions = {}) {
  const {
    refreshInterval = API_CONFIG.REFRESH_INTERVALS.ML_METRICS,
    enabled = true
  } = options;
  
  const [modelStatus, setModelStatus] = useState<MLModelStatus | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isTraining, setIsTraining] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    let isMounted = true;
    let intervalId: NodeJS.Timeout;
    
    // Fonction pour charger les données
    const loadData = async () => {
      if (!enabled) return;
      
      try {
        setIsLoading(true);
        const status = await MLModelService.getModelStatus();
        
        if (isMounted) {
          setModelStatus(status);
          setIsTraining(status.isTraining);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err : new Error('Erreur inconnue'));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    
    // Charger les données immédiatement
    loadData();
    
    // Configurer l'intervalle de rafraîchissement
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
  }, [refreshInterval, enabled]);
  
  // Fonction pour démarrer l'entraînement du modèle
  const trainModel = async (trainingData?: any[]) => {
    try {
      setIsTraining(true);
      const updatedStatus = await MLModelService.trainModel(trainingData);
      setModelStatus(updatedStatus);
      setError(null);
      return updatedStatus;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erreur inconnue');
      setError(error);
      throw error;
    } finally {
      setIsTraining(false);
    }
  };
  
  // Fonction pour forcer le rechargement des données
  const refetch = async () => {
    try {
      setIsLoading(true);
      const status = await MLModelService.getModelStatus();
      setModelStatus(status);
      setIsTraining(status.isTraining);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Erreur inconnue'));
    } finally {
      setIsLoading(false);
    }
  };
  
  return { modelStatus, isLoading, isTraining, error, trainModel, refetch };
}
