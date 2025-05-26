
import { useState, useEffect } from 'react';
import { Cpu, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

interface Machine {
  id: string;
  name: string;
  status: 'normal' | 'warning' | 'critical';
  temperature: number;
  pressure: number;
  vibration: number;
  riskScore: number;
}

export const MachineStatusGrid = () => {
  const [machines, setMachines] = useState<Machine[]>([]);

  useEffect(() => {
    const generateMachines = (): Machine[] => {
      return Array.from({ length: 6 }, (_, i) => {
        const riskScore = Math.random() * 100;
        let status: Machine['status'] = 'normal';
        if (riskScore > 80) status = 'critical';
        else if (riskScore > 60) status = 'warning';

        return {
          id: `machine-${i + 1}`,
          name: `Machine ${i + 1}`,
          status,
          temperature: 60 + Math.random() * 20,
          pressure: 1.8 + Math.random() * 1.2,
          vibration: 0.3 + Math.random() * 0.9,
          riskScore
        };
      });
    };

    setMachines(generateMachines());
    const interval = setInterval(() => {
      setMachines(generateMachines());
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status: Machine['status']) => {
    switch (status) {
      case 'normal':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'critical':
        return <XCircle className="w-5 h-5 text-red-500" />;
    }
  };

  const getStatusColor = (status: Machine['status']) => {
    switch (status) {
      case 'normal':
        return 'from-green-500 to-emerald-500';
      case 'warning':
        return 'from-yellow-500 to-amber-500';
      case 'critical':
        return 'from-red-500 to-rose-500';
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-md rounded-xl p-6 shadow-lg border border-gray-200/50">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">État des Machines</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {machines.map((machine) => (
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
                <div className="text-lg font-bold text-gray-900">{machine.riskScore.toFixed(0)}%</div>
                <div className="text-xs text-gray-500">Risque</div>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-3 text-sm">
              <div>
                <div className="text-gray-500">Temp</div>
                <div className="font-medium">{machine.temperature.toFixed(1)}°C</div>
              </div>
              <div>
                <div className="text-gray-500">Press</div>
                <div className="font-medium">{machine.pressure.toFixed(2)} bar</div>
              </div>
              <div>
                <div className="text-gray-500">Vib</div>
                <div className="font-medium">{machine.vibration.toFixed(2)} mm/s</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
