import { AnomalyPrediction } from '@/types/prediction';

/**
 * Service pour la gestion des données industrielles et des prédictions
 */
export class DataService {
  private static readonly STORAGE_KEY = 'penda_predictions';
  private static readonly MAX_STORED_PREDICTIONS = 1000;

  /**
   * Enregistre une prédiction dans le stockage local
   */
  static savePrediction(prediction: AnomalyPrediction): void {
    try {
      // Récupérer les prédictions existantes
      const existingPredictions = this.getStoredPredictions();
      
      // Ajouter la nouvelle prédiction
      existingPredictions.unshift(prediction);
      
      // Limiter le nombre de prédictions stockées
      if (existingPredictions.length > this.MAX_STORED_PREDICTIONS) {
        existingPredictions.length = this.MAX_STORED_PREDICTIONS;
      }
      
      // Enregistrer dans le stockage local
      localStorage.setItem(
        this.STORAGE_KEY, 
        JSON.stringify(existingPredictions)
      );
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement de la prédiction:', error);
    }
  }

  /**
   * Récupère toutes les prédictions stockées
   */
  static getStoredPredictions(): AnomalyPrediction[] {
    try {
      const storedData = localStorage.getItem(this.STORAGE_KEY);
      if (!storedData) return [];
      
      const predictions = JSON.parse(storedData);
      
      // Convertir les dates de string à Date
      return predictions.map((p: any) => ({
        ...p,
        timestamp: new Date(p.timestamp)
      }));
    } catch (error) {
      console.error('Erreur lors de la récupération des prédictions:', error);
      return [];
    }
  }

  /**
   * Supprime toutes les prédictions stockées
   */
  static clearStoredPredictions(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.error('Erreur lors de la suppression des prédictions:', error);
    }
  }

  /**
   * Exporte les prédictions au format CSV
   */
  static exportPredictionsToCSV(predictions: AnomalyPrediction[]): void {
    try {
      const headers = [
        'ID', 'Date', 'Heure', 'Machine', 'Score de risque', 'Sévérité', 
        'Température', 'Pression', 'Vibration', 'Rotation', 'Courant', 'Tension', 'Facteurs'
      ];
      
      const rows = predictions.map(p => [
        p.id,
        p.timestamp.toLocaleDateString(),
        p.timestamp.toLocaleTimeString(),
        p.machine,
        p.riskScore.toFixed(2),
        p.severity,
        p.rawData.temperature.toFixed(2),
        p.rawData.pressure.toFixed(2),
        p.rawData.vibration.toFixed(2),
        p.rawData.rotation.toFixed(2),
        p.rawData.current.toFixed(2),
        p.rawData.voltage.toFixed(2),
        p.factors.join('; ')
      ]);
      
      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(','))
      ].join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `penda_predictions_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Erreur lors de l\'export des prédictions:', error);
    }
  }

  /**
   * Analyse un fichier CSV ou JSON pour extraire les données
   */
  static async parseDataFile(file: File): Promise<any[]> {
    try {
      const text = await file.text();
      let data: any[] = [];
      
      if (file.name.endsWith('.csv')) {
        // Parse CSV
        const lines = text.split('\n');
        const headers = lines[0].split(',').map(h => h.trim());
        
        for (let i = 1; i < lines.length; i++) {
          if (!lines[i].trim()) continue;
          
          const values = lines[i].split(',').map(v => v.trim());
          const row: Record<string, string> = {};
          
          headers.forEach((header, index) => {
            row[header] = values[index] || '';
          });
          
          data.push(row);
        }
      } else if (file.name.endsWith('.json')) {
        // Parse JSON
        const jsonData = JSON.parse(text);
        data = Array.isArray(jsonData) ? jsonData : [jsonData];
      } else {
        throw new Error('Format de fichier non supporté. Utilisez CSV ou JSON.');
      }
      
      return data;
    } catch (error) {
      console.error('Erreur lors de l\'analyse du fichier:', error);
      throw error;
    }
  }

  /**
   * Génère des données synthétiques pour la démonstration
   */
  static generateSyntheticData(count: number = 100): any[] {
    const data = [];
    const machines = ['Machine 1', 'Machine 2', 'Machine 3', 'Machine 4', 'Machine 5'];
    
    for (let i = 0; i < count; i++) {
      const date = new Date();
      date.setDate(date.getDate() - Math.floor(Math.random() * 30)); // Données sur les 30 derniers jours
      
      data.push({
        timestamp: date.toISOString(),
        machine: machines[Math.floor(Math.random() * machines.length)],
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
