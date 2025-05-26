import { ApiClient } from './apiClient';
import { API_CONFIG } from '@/config/api.config';

// Types pour les machines
export interface MachineStatusData {
  id: string;
  name: string;
  status: 'online' | 'offline' | 'warning' | 'maintenance';
  lastUpdate: Date;
  metrics: {
    uptime: number;
    efficiency: number;
    temperature: number;
    load: number;
  };
}

export class MachineService {
  // Récupère tous les statuts des machines
  static async getAllMachines(): Promise<MachineStatusData[]> {
    try {
      const machines = await ApiClient.get<any[]>(API_CONFIG.ENDPOINTS.MACHINES);
      return machines.map(machine => ({
        ...machine,
        lastUpdate: new Date(machine.lastUpdate)
      }));
    } catch (error) {
      console.error('Erreur lors de la récupération des machines:', error);
      // En cas d'erreur, retourner des données de démo
      return MachineService.generateDemoMachines();
    }
  }

  // Récupère une machine spécifique par son ID
  static async getMachineById(machineId: string): Promise<MachineStatusData | null> {
    try {
      const machine = await ApiClient.get<any>(`${API_CONFIG.ENDPOINTS.MACHINES}/${machineId}`);
      return {
        ...machine,
        lastUpdate: new Date(machine.lastUpdate)
      };
    } catch (error) {
      console.error(`Erreur lors de la récupération de la machine ${machineId}:`, error);
      return null;
    }
  }

  // Génère des données de démo pour les machines
  private static generateDemoMachines(): MachineStatusData[] {
    const demoMachines: MachineStatusData[] = [];
    const statuses: Array<'online' | 'offline' | 'warning' | 'maintenance'> = ['online', 'offline', 'warning', 'maintenance'];
    
    for (let i = 1; i <= 6; i++) {
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      
      demoMachines.push({
        id: `machine-${i}`,
        name: `Machine ${i}`,
        status,
        lastUpdate: new Date(Date.now() - Math.floor(Math.random() * 3600000)),
        metrics: {
          uptime: Math.floor(Math.random() * 1000),
          efficiency: Math.random() * 100,
          temperature: 20 + Math.random() * 60,
          load: Math.random() * 100
        }
      });
    }
    
    return demoMachines;
  }
}
