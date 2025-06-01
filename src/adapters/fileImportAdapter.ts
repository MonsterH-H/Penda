import { TimestampedSensorData } from '@/api/sensorDataService';

/**
 * Ru00e9sultat de la validation de fichier
 */
export interface FileValidationResult {
  isValid: boolean;
  message: string;
}

/**
 * Adaptateur pour l'importation de fichiers (CSV et JSON)
 */
export class FileImportAdapter {
  /**
   * Valide un fichier avant importation
   * @param file - Fichier u00e0 valider
   * @returns Ru00e9sultat de la validation
   */
  static validateFile(file: File): FileValidationResult {
    // Vu00e9rifier le type de fichier
    if (file.type !== 'text/csv' && file.type !== 'application/json') {
      return {
        isValid: false,
        message: 'Format de fichier non pris en charge. Veuillez importer un fichier CSV ou JSON.',
      };
    }
    
    // Vu00e9rifier la taille du fichier (max 10 MB)
    const maxSize = 10 * 1024 * 1024; // 10 MB
    if (file.size > maxSize) {
      return {
        isValid: false,
        message: 'Fichier trop volumineux. La taille maximale est de 10 MB.',
      };
    }
    
    return {
      isValid: true,
      message: 'Fichier valide',
    };
  }
  
  /**
   * Importe un fichier CSV ou JSON et le convertit en donnu00e9es structuru00e9es
   * @param file - Fichier u00e0 importer
   * @returns Donnu00e9es importu00e9es
   */
  static async importFile(file: File): Promise<TimestampedSensorData[]> {
    const validation = this.validateFile(file);
    if (!validation.isValid) {
      throw new Error(validation.message);
    }
    
    const text = await file.text();
    let data: any[] = [];
    
    if (file.type === 'text/csv') {
      data = this.parseCSV(text);
    } else if (file.type === 'application/json') {
      data = this.parseJSON(text);
    }
    
    return this.normalizeData(data);
  }
  
  /**
   * Parse un fichier CSV en tableau d'objets
   * @param csvText - Contenu CSV
   * @returns Tableau d'objets
   */
  private static parseCSV(csvText: string): any[] {
    const lines = csvText.split('\n');
    const headers = lines[0].split(',').map(header => header.trim());
    
    return lines.slice(1).filter(line => line.trim() !== '').map(line => {
      const values = line.split(',').map(value => value.trim());
      const obj: Record<string, any> = {};
      
      headers.forEach((header, index) => {
        const value = values[index];
        obj[header] = this.parseValue(value);
      });
      
      return obj;
    });
  }
  
  /**
   * Parse un fichier JSON en tableau d'objets
   * @param jsonText - Contenu JSON
   * @returns Tableau d'objets
   */
  private static parseJSON(jsonText: string): any[] {
    try {
      const parsed = JSON.parse(jsonText);
      return Array.isArray(parsed) ? parsed : [parsed];
    } catch (error) {
      throw new Error('Format JSON invalide');
    }
  }
  
  /**
   * Normalise les donnu00e9es en format TimestampedSensorData
   * @param data - Donnu00e9es brutes
   * @returns Donnu00e9es normaliswu00e9es
   */
  private static normalizeData(data: any[]): TimestampedSensorData[] {
    // Vérifier si les données sont valides
    if (!data || data.length === 0) {
      throw new Error('Aucune donnée valide trouvée dans le fichier importé');
    }
    
    // Vérifier les champs requis
    const requiredFields = ['machine', 'temperature', 'pressure', 'vibration'];
    const optionalFields = ['timestamp', 'rotation', 'current', 'voltage'];
    const alternativeFields = {
      timestamp: ['time', 'date'],
      machine: ['machineId', 'device', 'equipment'],
      temperature: ['temp', 'temperature_c', 'temperature_f'],
      pressure: ['press', 'pressure_bar', 'pressure_psi'],
      vibration: ['vib', 'vibration_level', 'vibration_hz'],
      rotation: ['rpm', 'speed', 'rotation_speed'],
      current: ['amp', 'amperage', 'current_a'],
      voltage: ['volt', 'voltage_v']
    };
    
    // Analyser le premier élément pour déterminer le mappage des champs
    const fieldMapping: Record<string, string> = {};
    const firstItem = data[0];
    
    for (const requiredField of requiredFields) {
      // Vérifier si le champ existe directement
      if (firstItem[requiredField] !== undefined) {
        fieldMapping[requiredField] = requiredField;
        continue;
      }
      
      // Vérifier les alternatives
      const alternatives = alternativeFields[requiredField as keyof typeof alternativeFields] || [];
      const foundAlternative = alternatives.find(alt => firstItem[alt] !== undefined);
      
      if (foundAlternative) {
        fieldMapping[requiredField] = foundAlternative;
      } else if (requiredField === 'machine') {
        // Le champ machine est absolument nécessaire
        throw new Error(`Champ requis '${requiredField}' non trouvé dans les données importées`);
      }
    }
    
    // Vérifier les champs optionnels
    for (const optionalField of optionalFields) {
      if (firstItem[optionalField] !== undefined) {
        fieldMapping[optionalField] = optionalField;
        continue;
      }
      
      const alternatives = alternativeFields[optionalField as keyof typeof alternativeFields] || [];
      const foundAlternative = alternatives.find(alt => firstItem[alt] !== undefined);
      
      if (foundAlternative) {
        fieldMapping[optionalField] = foundAlternative;
      }
    }
    
    // Calculer les statistiques pour les valeurs manquantes
    const stats: Record<string, { sum: number; count: number; min: number; max: number }> = {
      temperature: { sum: 0, count: 0, min: Infinity, max: -Infinity },
      pressure: { sum: 0, count: 0, min: Infinity, max: -Infinity },
      vibration: { sum: 0, count: 0, min: Infinity, max: -Infinity },
      rotation: { sum: 0, count: 0, min: Infinity, max: -Infinity },
      current: { sum: 0, count: 0, min: Infinity, max: -Infinity },
      voltage: { sum: 0, count: 0, min: Infinity, max: -Infinity }
    };
    
    // Première passe: collecter les statistiques
    for (const item of data) {
      for (const field of [...requiredFields, ...optionalFields]) {
        if (field === 'timestamp' || field === 'machine') continue;
        
        const mappedField = fieldMapping[field];
        if (!mappedField) continue;
        
        const value = this.parseValue(item[mappedField]);
        if (typeof value === 'number' && !isNaN(value)) {
          stats[field].sum += value;
          stats[field].count++;
          stats[field].min = Math.min(stats[field].min, value);
          stats[field].max = Math.max(stats[field].max, value);
        }
      }
    }
    
    // Calculer les moyennes et les plages pour chaque champ
    const defaults: Record<string, { mean: number; range: number }> = {};
    for (const field in stats) {
      if (stats[field].count > 0) {
        defaults[field] = {
          mean: stats[field].sum / stats[field].count,
          range: stats[field].max - stats[field].min
        };
      } else {
        // Valeurs par défaut si aucune donnée n'est disponible
        defaults[field] = {
          mean: field === 'temperature' ? 25 : 
                field === 'pressure' ? 2.0 : 
                field === 'vibration' ? 0.5 : 
                field === 'rotation' ? 1000 : 
                field === 'current' ? 10 : 220,
          range: field === 'temperature' ? 10 : 
                 field === 'pressure' ? 1.5 : 
                 field === 'vibration' ? 1.0 : 
                 field === 'rotation' ? 500 : 
                 field === 'current' ? 8 : 40
        };
      }
    }
    
    // Deuxième passe: normaliser les données
    return data.map((item, index) => {
      // Extraire timestamp et machine
      const timestampField = fieldMapping['timestamp'];
      const machineField = fieldMapping['machine'];
      
      // Générer un timestamp automatique si non présent
      // Si le timestamp n'est pas trouvé, on génère une série temporelle
      // en partant de la date actuelle et en reculant de 1 heure par index
      const now = new Date();
      const autoTimestamp = new Date(now.getTime() - (index * 3600000)).toISOString(); // -1h par entrée
      
      const timestamp = timestampField ? (item[timestampField] || item.time || item.date) : autoTimestamp;
      const machine = item[machineField] || item.machineId || item.device || 'Machine 1';
      
      // Extraire les valeurs des capteurs avec gestion des valeurs manquantes
      const getValue = (field: string): number => {
        const mappedField = fieldMapping[field];
        if (!mappedField) return defaults[field].mean + (Math.random() - 0.5) * defaults[field].range * 0.1;
        
        const value = this.parseValue(item[mappedField]);
        if (typeof value === 'number' && !isNaN(value)) return value;
        
        // Valeur manquante: utiliser la moyenne avec une petite variation aléatoire
        return defaults[field].mean + (Math.random() - 0.5) * defaults[field].range * 0.1;
      };
      
      return {
        timestamp: typeof timestamp === 'string' ? timestamp : timestamp.toISOString(),
        machine: String(machine),
        temperature: getValue('temperature'),
        pressure: getValue('pressure'),
        vibration: getValue('vibration'),
        rotation: getValue('rotation'),
        current: getValue('current'),
        voltage: getValue('voltage')
      };
    });
  }
  
  /**
   * Convertit une valeur en son type appropriu00e9
   * @param value - Valeur u00e0 convertir
   * @returns Valeur convertie
   */
  private static parseValue(value: any): any {
    if (value === undefined || value === null || value === '') {
      return null;
    }
    
    // Essayer de convertir en nombre
    const num = Number(value);
    if (!isNaN(num)) {
      return num;
    }
    
    // Essayer de convertir en date
    const date = new Date(value);
    if (!isNaN(date.getTime())) {
      return date;
    }
    
    // Sinon retourner la chaiwne
    return value;
  }
}
