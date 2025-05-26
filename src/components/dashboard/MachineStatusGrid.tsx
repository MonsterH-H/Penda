
import { Cpu, AlertTriangle, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { useMachineStatus, MachineStatusData } from '@/hooks/data/useMachineStatus';
import { API_CONFIG } from '@/config/api.config';

export const MachineStatusGrid = () => {
  // Utiliser le hook pour récupérer l'état des machines
  const { machines, isLoading, error } = useMachineStatus();


  const getStatusIcon = (status: MachineStatusData['status']) => {
    switch (status) {
      case 'online':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'offline':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'maintenance':
        return <Cpu className="w-5 h-5 text-blue-500" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: MachineStatusData['status']) => {
    switch (status) {
      case 'online':
        return 'from-green-500 to-emerald-500';
      case 'warning':
        return 'from-yellow-500 to-amber-500';
      case 'offline':
        return 'from-red-500 to-rose-500';
      case 'maintenance':
        return 'from-blue-500 to-indigo-500';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  // Afficher un indicateur de chargement si nécessaire
  if (isLoading && machines.length === 0) {
    return (
      <div className="bg-white/80 backdrop-blur-md rounded-xl p-6 shadow-lg border border-gray-200/50">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">État des Machines</h3>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <span className="ml-2 text-gray-600">Chargement des données...</span>
        </div>
      </div>
    );
  }
  
  // Afficher un message d'erreur si nécessaire
  if (error) {
    return (
      <div className="bg-white/80 backdrop-blur-md rounded-xl p-6 shadow-lg border border-gray-200/50">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">État des Machines</h3>
        <div className="p-4 bg-red-50 text-red-600 rounded-lg">
          <p>Erreur lors du chargement des données: {error}</p>
          <p className="text-sm mt-2">Des données de démonstration sont affichées à la place.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/80 backdrop-blur-md rounded-xl p-6 shadow-lg border border-gray-200/50">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">État des Machines</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {machines.length > 0 ? machines.map((machine) => (
          <div
            key={machine.id}
            className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition-all duration-200"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 bg-gradient-to-r ${getStatusColor(machine.status)} rounded-lg flex items-center justify-center`}>
                  <Cpu className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{machine.name}</h4>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(machine.status)}
                    <span className="text-sm text-gray-600 capitalize">{machine.status}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-gray-900">{machine.metrics?.efficiency ? machine.metrics.efficiency.toFixed(0) : 0}%</div>
                <div className="text-xs text-gray-500">Efficacité</div>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-3 text-sm">
              <div>
                <div className="text-gray-500">Temp</div>
                <div className="font-medium">{machine.metrics?.temperature ? machine.metrics.temperature.toFixed(1) : '0.0'}°C</div>
              </div>
              <div>
                <div className="text-gray-500">Charge</div>
                <div className="font-medium">{machine.metrics?.load ? machine.metrics.load.toFixed(2) : '0.00'}%</div>
              </div>
              <div>
                <div className="text-gray-500">Uptime</div>
                <div className="font-medium">{machine.metrics?.uptime ? machine.metrics.uptime.toFixed(0) : '0'}h</div>
              </div>
            </div>
          </div>
        )) : (
          <div className="col-span-2 p-4 bg-gray-50 rounded-lg text-gray-500 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-amber-500 mr-2" />
            Aucune machine disponible
          </div>
        )}
      </div>
    </div>
  );
};
