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
    return data.map(item => {
      // Mapper les noms de champs potentiellement diffu00e9rents
      const timestamp = item.timestamp || item.time || item.date || new Date().toISOString();
      const machine = item.machine || item.machineId || item.device || 'Machine 1';
      
      // Ru00e9cupu00e9rer les valeurs des capteurs
      const temperature = this.parseValue(item.temperature);
      const pressure = this.parseValue(item.pressure);
      const vibration = this.parseValue(item.vibration);
      const rotation = this.parseValue(item.rotation || item.rpm);
      const current = this.parseValue(item.current);
      const voltage = this.parseValue(item.voltage);
      
      return {
        timestamp: typeof timestamp === 'string' ? timestamp : timestamp.toISOString(),
        machine: String(machine),
        temperature: typeof temperature === 'number' ? temperature : 25 + Math.random() * 10,
        pressure: typeof pressure === 'number' ? pressure : 2.0 + Math.random() * 1.5,
        vibration: typeof vibration === 'number' ? vibration : 0.5 + Math.random() * 1.0,
        rotation: typeof rotation === 'number' ? rotation : 1000 + Math.random() * 500,
        current: typeof current === 'number' ? current : 10 + Math.random() * 8,
        voltage: typeof voltage === 'number' ? voltage : 220 + Math.random() * 40
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
