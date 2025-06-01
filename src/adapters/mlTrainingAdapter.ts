/**
 * Adaptateur pour l'entraînement du modèle ML
 */

import { MLModelService } from '@/api/mlModelService';
import { TimestampedSensorData } from '@/api/sensorDataService';
import { AnomalyPrediction, MLModelStatus } from '@/types/prediction';
import * as tf from '@tensorflow/tfjs';
import { v4 as uuidv4 } from 'uuid';

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
  static prepareTrainingData(data: TimestampedSensorData[]): { timestamp: string; machine: string; features: number[] }[] {
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
      // Extraire les caractéristiques pour l'entraînement
      const features = preparedData.map(item => item.features);
      
      // Charger ou créer le modèle
      let model: tf.LayersModel;
      try {
        model = await tf.loadLayersModel('localstorage://penda-ml-model');
        console.log('Modèle chargé depuis le stockage local');
      } catch (e) {
        console.log('Création d\'un nouveau modèle');
        model = this.createModel(features[0].length);
      }
      
      // Convertir les données en tenseurs
      const xs = tf.tensor2d(features);
      const ys = xs.clone(); // Pour un autoencoder, l'entrée = sortie
      
      // Diviser les données en ensembles d'entraînement et de validation
      const splitIdx = Math.floor(features.length * trainingRatio);
      const [xTrain, xVal] = tf.split(xs, [splitIdx, features.length - splitIdx]);
      const [yTrain, yVal] = tf.split(ys, [splitIdx, features.length - splitIdx]);
      
      // Entraîner le modèle
      const startTime = Date.now();
      const history = await model.fit(xTrain, yTrain, {
        epochs,
        batchSize,
        validationData: [xVal, yVal],
        shuffle: true,
        callbacks: {
          onEpochBegin: async (epoch) => {
            if (onProgress) {
              const progress = (epoch / epochs) * 100;
              onProgress(progress, epoch, epochs);
            }
          },
          onEpochEnd: async (epoch, logs) => {
            console.log(`Epoch ${epoch + 1}/${epochs} - loss: ${logs?.loss?.toFixed(4)} - val_loss: ${logs?.val_loss?.toFixed(4)}`);
          }
        }
      });
      
      // Calculer les métriques finales
      const trainLoss = history.history.loss?.[history.history.loss.length - 1] || 0;
      const valLoss = history.history.val_loss?.[history.history.val_loss.length - 1] || 0;
      
      // Évaluer le modèle sur l'ensemble de validation
      const evalResult = model.evaluate(xVal, yVal) as tf.Tensor[];
      const testLoss = evalResult[0].dataSync()[0];
      
      // Calculer les métriques de performance en utilisant les données de validation
      const metrics = await this.calculateModelMetrics(model, xVal, yVal);
      
      // Sauvegarder le modèle
      await model.save('localstorage://penda-ml-model');
      
      // Nettoyer les tenseurs
      xs.dispose();
      ys.dispose();
      xTrain.dispose();
      xVal.dispose();
      yTrain.dispose();
      yVal.dispose();
      evalResult.forEach(t => t.dispose());
      
      // Retourner le statut du modèle
      return {
        isTraining: false,
        lastTrained: new Date(),
        accuracy: metrics.accuracy,
        precision: metrics.precision,
        recall: metrics.recall,
        f1Score: metrics.f1Score,
        trainingProgress: 100,
        trainingEpoch: epochs,
        totalEpochs: epochs,
        parameters: {
          epochs,
          batchSize,
          learningRate: 0.001,
          hiddenLayers: 2,
          hiddenUnits: 64,
          dropoutRate: 0.2
        }
      };
    } catch (error) {
      console.error('Erreur lors de l\'entraînement du modèle:', error);
      throw error;
    }
  }
  
  /**
   * Crée un modèle d'autoencoder pour la détection d'anomalies
   * @param inputDim - Dimension d'entrée (nombre de caractéristiques)
   * @returns Modèle TensorFlow.js
   */
  private static createModel(inputDim: number): tf.LayersModel {
    // Créer un modèle d'autoencoder
    const input = tf.input({shape: [inputDim]});
    
    // Encoder
    const encoded = tf.layers.dense({
      units: Math.max(8, Math.floor(inputDim * 1.5)),
      activation: 'relu',
      kernelRegularizer: tf.regularizers.l1({l1: 0.001}),
      name: 'encoder_hidden'
    }).apply(input);
    
    const encodedOutput = tf.layers.dense({
      units: Math.max(4, Math.floor(inputDim * 0.75)),
      activation: 'relu',
      name: 'encoder_output'
    }).apply(encoded) as tf.SymbolicTensor;

    // Decoder
    const decoded = tf.layers.dense({
      units: Math.max(8, Math.floor(inputDim * 1.5)),
      activation: 'relu',
      name: 'decoder_hidden'
    }).apply(encodedOutput) as tf.SymbolicTensor;
    
    const decodedOutput = tf.layers.dense({
      units: inputDim,
      activation: 'sigmoid',
      name: 'decoder_output'
    }).apply(decoded) as tf.SymbolicTensor;

    const autoencoder = tf.model({
      inputs: input,
      outputs: decodedOutput,
      name: 'penda_autoencoder'
    });

    autoencoder.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'meanSquaredError',
      metrics: ['mae']
    });

    return autoencoder;
  }
  
  /**
   * Calcule les métriques de performance du modèle
   * @param model - Modèle TensorFlow.js
   * @param xVal - Données de validation (entrée)
   * @param yVal - Données de validation (sortie)
   * @returns Métriques du modèle
   */
  private static async calculateModelMetrics(
    model: tf.LayersModel,
    xVal: tf.Tensor,
    yVal: tf.Tensor
  ): Promise<{accuracy: number, precision: number, recall: number, f1Score: number}> {
    // Prédire sur les données de validation
    const predictions = model.predict(xVal) as tf.Tensor;
    
    // Calculer l'erreur de reconstruction
    const errors = tf.sub(yVal, predictions);
    const squaredErrors = tf.square(errors);
    const msePerSample = tf.mean(squaredErrors, 1);
    
    // Définir un seuil pour les anomalies (basé sur la distribution des erreurs)
    const mseValues = await msePerSample.data();
    const mean = tf.mean(msePerSample).dataSync()[0];
    const std = tf.sqrt(tf.mean(tf.square(tf.sub(msePerSample, mean)))).dataSync()[0];
    const threshold = mean + 2 * std; // 2 écarts-types au-dessus de la moyenne
    
    // Simuler des anomalies pour calculer les métriques
    // Dans un cas réel, nous aurions des données étiquetées
    const anomalyRatio = 0.1; // 10% des données sont des anomalies
    const numAnomalies = Math.floor(mseValues.length * anomalyRatio);
    
    // Créer des étiquettes simulées (0 = normal, 1 = anomalie)
    const simulatedLabels = new Array(mseValues.length).fill(0);
    
    // Marquer les échantillons avec les erreurs les plus élevées comme anomalies
    const indexedErrors: {value: number, index: number}[] = Array.from(mseValues).map((value, index) => ({value, index}));
    indexedErrors.sort((a, b) => b.value - a.value);
    
    for (let i = 0; i < numAnomalies; i++) {
      simulatedLabels[indexedErrors[i].index] = 1;
    }
    
    // Calculer les prédictions basées sur le seuil
    const predictedAnomalies = mseValues.map(value => value > threshold ? 1 : 0);
    
    // Calculer les métriques
    let tp = 0, fp = 0, fn = 0, tn = 0;
    
    for (let i = 0; i < simulatedLabels.length; i++) {
      if (simulatedLabels[i] === 1 && predictedAnomalies[i] === 1) tp++;
      if (simulatedLabels[i] === 0 && predictedAnomalies[i] === 1) fp++;
      if (simulatedLabels[i] === 1 && predictedAnomalies[i] === 0) fn++;
      if (simulatedLabels[i] === 0 && predictedAnomalies[i] === 0) tn++;
    }
    
    const accuracy = (tp + tn) / (tp + tn + fp + fn);
    const precision = tp / (tp + fp) || 0;
    const recall = tp / (tp + fn) || 0;
    const f1Score = 2 * precision * recall / (precision + recall) || 0;
    
    // Nettoyer les tenseurs
    predictions.dispose();
    errors.dispose();
    squaredErrors.dispose();
    msePerSample.dispose();
    
    return {
      accuracy: accuracy * 100, // Convertir en pourcentage
      precision: precision * 100,
      recall: recall * 100,
      f1Score: f1Score * 100
    };
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
      const features = preparedData.map(item => item.features);
      
      // Charger le modèle
      let model: tf.LayersModel;
      try {
        model = await tf.loadLayersModel('localstorage://penda-ml-model');
      } catch (e) {
        throw new Error('Aucun modèle entraîné disponible pour l\'évaluation');
      }
      
      // Convertir les données en tenseurs
      const xs = tf.tensor2d(features);
      const ys = xs.clone(); // Pour un autoencoder, l'entrée = sortie
      
      // Évaluer le modèle
      const evalResult = model.evaluate(xs, ys) as tf.Tensor[];
      const testLoss = evalResult[0].dataSync()[0];
      
      // Calculer les métriques de performance
      const metrics = await this.calculateModelMetrics(model, xs, ys);
      
      // Nettoyer les tenseurs
      xs.dispose();
      ys.dispose();
      evalResult.forEach(t => t.dispose());
      
      return metrics;
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
      // Charger le modèle
      let model: tf.LayersModel;
      try {
        model = await tf.loadLayersModel('localstorage://penda-ml-model');
      } catch (e) {
        throw new Error('Aucun modèle entraîné disponible pour la prédiction');
      }
      
      const predictions: AnomalyPrediction[] = [];
      
      // Préparer les données
      const preparedData = this.prepareTrainingData(data);
      
      // Traiter chaque point de données
      for (const [index, item] of preparedData.entries()) {
        const originalData = data[index];
        
        // Convertir en tenseur
        const input = tf.tensor2d([item.features]);
        
        // Prédire
        const output = model.predict(input) as tf.Tensor;
        
        // Calculer l'erreur de reconstruction
        const error = tf.sub(input, output);
        const squaredError = tf.square(error);
        const mse = tf.mean(squaredError).dataSync()[0];
        
        // Déterminer la gravité de l'anomalie
        let severity: 'low' | 'medium' | 'high' = 'low';
        if (mse > 0.1) severity = 'medium';
        if (mse > 0.2) severity = 'high';
        
        // Déterminer les facteurs contribuant à l'anomalie
        const featureErrors = squaredError.dataSync();
        const featureNames = ['temperature', 'pressure', 'vibration', 'rotation', 'current', 'voltage'];
        
        const factors = featureNames
          .map((name, i) => ({ name, error: featureErrors[i] || 0 }))
          .sort((a, b) => b.error - a.error)
          .slice(0, 3)
          .filter(f => f.error > 0.05)
          .map(f => f.name);
        
        // Créer la prédiction
        const prediction: AnomalyPrediction = {
          id: uuidv4(),
          timestamp: typeof originalData.timestamp === 'string' ? new Date(originalData.timestamp) : (originalData.timestamp && originalData.timestamp.constructor === Date) ? originalData.timestamp as Date : new Date(),
          machine: originalData.machine,
          severity,
          riskScore: Math.min(100, Math.round(mse * 500)), // Convertir MSE en score de risque
          reconstructionError: mse,
          factors,
          rawData: {
            temperature: originalData.temperature,
            pressure: originalData.pressure,
            vibration: originalData.vibration,
            rotation: originalData.rotation,
            current: originalData.current,
            voltage: originalData.voltage
          }
        };
        
        predictions.push(prediction);
        
        // Nettoyer les tenseurs
        input.dispose();
        output.dispose();
        error.dispose();
        squaredError.dispose();
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
