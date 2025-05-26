
import { useState } from 'react';
import { Plus, Edit, Trash2, Power, PowerOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

interface Machine {
  id: string;
  name: string;
  type: string;
  status: 'active' | 'inactive' | 'maintenance';
  location: string;
  installDate: Date;
  sensors: string[];
}

export const MachineManagement = () => {
  const { toast } = useToast();
  const [machines, setMachines] = useState<Machine[]>([
    {
      id: '1',
      name: 'Machine 1',
      type: 'Presse hydraulique',
      status: 'active',
      location: 'Atelier A',
      installDate: new Date('2020-01-15'),
      sensors: ['température', 'pression', 'vibration']
    },
    {
      id: '2',
      name: 'Machine 2',
      type: 'Tour CNC',
      status: 'active',
      location: 'Atelier B',
      installDate: new Date('2019-06-20'),
      sensors: ['température', 'vibration', 'courant']
    },
    {
      id: '3',
      name: 'Machine 3',
      type: 'Fraiseuse',
      status: 'maintenance',
      location: 'Atelier A',
      installDate: new Date('2021-03-10'),
      sensors: ['température', 'pression', 'vibration', 'courant']
    }
  ]);

  const [isAddingMachine, setIsAddingMachine] = useState(false);
  const [editingMachine, setEditingMachine] = useState<string | null>(null);

  const getStatusBadge = (status: Machine['status']) => {
    const styles = {
      active: 'bg-green-100 text-green-700',
      inactive: 'bg-gray-100 text-gray-700',
      maintenance: 'bg-yellow-100 text-yellow-700'
    };
    
    const labels = {
      active: 'Active',
      inactive: 'Inactive',
      maintenance: 'Maintenance'
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  const handleStatusToggle = (machineId: string) => {
    setMachines(prev => prev.map(machine => 
      machine.id === machineId 
        ? { ...machine, status: machine.status === 'active' ? 'inactive' : 'active' as Machine['status'] }
        : machine
    ));
    
    toast({
      title: "Statut mis à jour",
      description: "Le statut de la machine a été modifié",
    });
  };

  const handleDeleteMachine = (machineId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette machine ?')) {
      setMachines(prev => prev.filter(machine => machine.id !== machineId));
      toast({
        title: "Machine supprimée",
        description: "La machine a été supprimée avec succès",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Gestion des Machines</h3>
          <p className="text-sm text-gray-600">Configurez et surveillez vos équipements industriels</p>
        </div>
        <Button onClick={() => setIsAddingMachine(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Ajouter une machine
        </Button>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-green-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-green-900">
            {machines.filter(m => m.status === 'active').length}
          </div>
          <div className="text-sm text-green-600">Machines actives</div>
        </div>
        <div className="bg-yellow-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-yellow-900">
            {machines.filter(m => m.status === 'maintenance').length}
          </div>
          <div className="text-sm text-yellow-600">En maintenance</div>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-gray-900">
            {machines.filter(m => m.status === 'inactive').length}
          </div>
          <div className="text-sm text-gray-600">Inactives</div>
        </div>
      </div>

      {/* Liste des machines */}
      <div className="space-y-4">
        {machines.map((machine) => (
          <div key={machine.id} className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <div>
                  <h4 className="font-semibold text-gray-900">{machine.name}</h4>
                  <p className="text-sm text-gray-600">{machine.type}</p>
                </div>
                {getStatusBadge(machine.status)}
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleStatusToggle(machine.id)}
                >
                  {machine.status === 'active' ? (
                    <PowerOff className="w-4 h-4" />
                  ) : (
                    <Power className="w-4 h-4" />
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingMachine(machine.id)}
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeleteMachine(machine.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Emplacement:</span>
                <div className="font-medium text-gray-900">{machine.location}</div>
              </div>
              <div>
                <span className="text-gray-500">Installation:</span>
                <div className="font-medium text-gray-900">
                  {machine.installDate.toLocaleDateString()}
                </div>
              </div>
              <div>
                <span className="text-gray-500">Capteurs:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {machine.sensors.map((sensor, index) => (
                    <span
                      key={index}
                      className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs"
                    >
                      {sensor}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {machines.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p className="text-lg font-medium">Aucune machine configurée</p>
          <p className="text-sm">Ajoutez votre première machine pour commencer</p>
        </div>
      )}
    </div>
  );
};
