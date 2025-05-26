import { useState, useEffect } from 'react';
import { MachineService, MachineStatusData } from '@/api/machineService';

// Re-exporting MachineStatusData for convenience
export type { MachineStatusData };

export function useMachineStatus() {
  const [machines, setMachines] = useState<MachineStatusData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMachineStatus = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await MachineService.getAllMachines();
        setMachines(response);
      } catch (err) {
        console.error('Erreur lors de la récupération des statuts machines:', err);
        setError('Impossible de récupérer les statuts des machines');
        // Utiliser des données de démo en cas d'erreur
        setMachines(generateDemoMachines());
      } finally {
        setIsLoading(false);
      }
    };

    fetchMachineStatus();
    
    // Récupérer les données toutes les 30 secondes
    const interval = setInterval(fetchMachineStatus, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const refreshMachineStatus = async () => {
    setIsLoading(true);
    try {
      const response = await MachineService.getAllMachines();
      setMachines(response);
      setError(null);
    } catch (err) {
      console.error('Erreur lors du rafraîchissement des statuts machines:', err);
      setError('Impossible de rafraîchir les statuts des machines');
    } finally {
      setIsLoading(false);
    }
  };

  // Générer des données de démo en cas d'erreur
  const generateDemoMachines = (): MachineStatusData[] => {
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
  };

  return { machines, isLoading, error, refreshMachineStatus };
}
