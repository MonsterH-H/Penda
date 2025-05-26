/**
 * Contexte pour la gestion globale des donnu00e9es ru00e9elles
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { DataAdapter } from '@/adapters/dataAdapter';
import { SensorDataService, TimestampedSensorData } from '@/api/sensorDataService';
import { MachineService, MachineStatusData } from '@/api/machineService';
import { MLModelService } from '@/api/mlModelService';
import { MLModelStatus, AnomalyPrediction } from '@/types/prediction';
import { API_CONFIG } from '@/config/api.config';

/**
 * Interface pour le contexte des donnu00e9es
 */
interface DataContextType {
  // Donnu00e9es en temps ru00e9el
  realTimeData: TimestampedSensorData[];
  isLoadingRealTime: boolean;
  realTimeError: Error | null;
  refreshRealTimeData: () => Promise<void>;
  
  // u00c9tat des machines
  machines: MachineStatusData[];
  isLoadingMachines: boolean;
  machinesError: Error | null;
  refreshMachines: () => Promise<void>;
  
  // Modu00e8le ML
  modelStatus: MLModelStatus | null;
  isLoadingModel: boolean;
  isTrainingModel: boolean;
  modelError: Error | null;
  trainModel: (data?: any[]) => Promise<void>;
  refreshModelStatus: () => Promise<void>;
  
  // Pru00e9dictions
  predictions: AnomalyPrediction[];
  addPrediction: (prediction: AnomalyPrediction) => void;
  clearPredictions: () => void;
  
  // Paramu00e8tres globaux
  selectedMachine: string | null;
  setSelectedMachine: (machineId: string | null) => void;
  dataRefreshInterval: number;
  setDataRefreshInterval: (interval: number) => void;
}

// Cru00e9ation du contexte
const DataContext = createContext<DataContextType | undefined>(undefined);

/**
 * Props pour le fournisseur de contexte
 */
interface DataProviderProps {
  children: ReactNode;
}

/**
 * Fournisseur du contexte de donnu00e9es
 */
export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
  // État pour les données en temps réel
  const [realTimeData, setRealTimeData] = useState<TimestampedSensorData[]>([]);
  const [isLoadingRealTime, setIsLoadingRealTime] = useState<boolean>(true);
  const [realTimeError, setRealTimeError] = useState<Error | null>(null);
  
  // État pour les machines
  const [machines, setMachines] = useState<MachineStatusData[]>([]);
  const [isLoadingMachines, setIsLoadingMachines] = useState<boolean>(true);
  const [machinesError, setMachinesError] = useState<Error | null>(null);
  
  // État pour le modèle ML
  const [modelStatus, setModelStatus] = useState<MLModelStatus | null>(null);
  const [isLoadingModel, setIsLoadingModel] = useState<boolean>(true);
  const [isTrainingModel, setIsTrainingModel] = useState<boolean>(false);
  const [modelError, setModelError] = useState<Error | null>(null);
  
  // u00c9tat pour les pru00e9dictions
  const [predictions, setPredictions] = useState<AnomalyPrediction[]>([]);
  
  // Paramu00e8tres globaux
  const [selectedMachine, setSelectedMachine] = useState<string | null>(null);
  const [dataRefreshInterval, setDataRefreshInterval] = useState<number>(
    API_CONFIG.REFRESH_INTERVALS.REAL_TIME
  );
  
  // Charger les donnu00e9es en temps ru00e9el
  const loadRealTimeData = async () => {
    try {
      setIsLoadingRealTime(true);
      const data = await SensorDataService.getRealTimeData(selectedMachine || undefined);
      setRealTimeData(data);
      setRealTimeError(null);
    } catch (err) {
      setRealTimeError(err instanceof Error ? err : new Error('Erreur inconnue'));
    } finally {
      setIsLoadingRealTime(false);
    }
  };
  
  // Charger les donnu00e9es des machines
  const loadMachines = async () => {
    try {
      setIsLoadingMachines(true);
      const data = await DataAdapter.getMachineStatusData();
      setMachines(data);
      setMachinesError(null);
    } catch (err) {
      setMachinesError(err instanceof Error ? err : new Error('Erreur inconnue'));
    } finally {
      setIsLoadingMachines(false);
    }
  };
  
  // Charger l'u00e9tat du modu00e8le ML
  const loadModelStatus = async () => {
    try {
      setIsLoadingModel(true);
      const status = await MLModelService.getModelStatus();
      setModelStatus(status);
      setModelError(null);
    } catch (err) {
      setModelError(err instanceof Error ? err : new Error('Erreur inconnue'));
    } finally {
      setIsLoadingModel(false);
    }
  };
  
  // Entrau00eener le modu00e8le ML
  const trainModel = async (data?: any[]) => {
    try {
      setIsTrainingModel(true);
      const status = await MLModelService.trainModel(data);
      setModelStatus(status);
      setModelError(null);
    } catch (err) {
      setModelError(err instanceof Error ? err : new Error('Erreur inconnue'));
      throw err;
    } finally {
      setIsTrainingModel(false);
    }
  };
  
  // Ajouter une pru00e9diction
  const addPrediction = (prediction: AnomalyPrediction) => {
    setPredictions(prev => [prediction, ...prev]);
    DataAdapter.savePrediction(prediction);
  };
  
  // Effacer toutes les pru00e9dictions
  const clearPredictions = () => {
    setPredictions([]);
    localStorage.removeItem('penda_predictions');
  };
  
  // Charger les donnu00e9es initiales
  useEffect(() => {
    // Charger les pru00e9dictions stocku00e9es
    const storedPredictions = DataAdapter.getStoredPredictions();
    setPredictions(storedPredictions);
    
    // Charger les donnu00e9es initiales
    loadRealTimeData();
    loadMachines();
    loadModelStatus();
    
    // Configurer les intervalles de rafrau00eechissement
    const realTimeInterval = setInterval(loadRealTimeData, dataRefreshInterval);
    const machinesInterval = setInterval(loadMachines, API_CONFIG.REFRESH_INTERVALS.MACHINE_STATUS);
    const modelInterval = setInterval(loadModelStatus, API_CONFIG.REFRESH_INTERVALS.ML_METRICS);
    
    return () => {
      clearInterval(realTimeInterval);
      clearInterval(machinesInterval);
      clearInterval(modelInterval);
    };
  }, [selectedMachine, dataRefreshInterval]);
  
  // Valeur du contexte
  const contextValue: DataContextType = {
    // Donnu00e9es en temps ru00e9el
    realTimeData,
    isLoadingRealTime,
    realTimeError,
    refreshRealTimeData: loadRealTimeData,
    
    // u00c9tat des machines
    machines,
    isLoadingMachines,
    machinesError,
    refreshMachines: loadMachines,
    
    // Modu00e8le ML
    modelStatus,
    isLoadingModel,
    isTrainingModel,
    modelError,
    trainModel,
    refreshModelStatus: loadModelStatus,
    
    // Pru00e9dictions
    predictions,
    addPrediction,
    clearPredictions,
    
    // Paramu00e8tres globaux
    selectedMachine,
    setSelectedMachine,
    dataRefreshInterval,
    setDataRefreshInterval
  };
  
  return (
    <DataContext.Provider value={contextValue}>
      {children}
    </DataContext.Provider>
  );
};

/**
 * Hook pour utiliser le contexte de données
 */
export function useData(): DataContextType {
  const context = useContext(DataContext);

  if (context === undefined) {
    throw new Error('useData doit être utilisé à l\'intérieur d\'un DataProvider');
  }

  return context;
};
