
import { useState, useEffect } from 'react';
import { AlertTriangle, Clock, TrendingUp } from 'lucide-react';

interface Alert {
  id: string;
  type: 'warning' | 'critical';
  message: string;
  machine: string;
  timestamp: Date;
  value: number;
}

export const AlertsPanel = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);

  useEffect(() => {
    const generateAlerts = (): Alert[] => {
      const alertMessages = [
        { message: 'Température élevée détectée', type: 'warning' as const },
        { message: 'Vibration anormale', type: 'critical' as const },
        { message: 'Pression hors limites', type: 'warning' as const },
        { message: 'Anomalie ML détectée', type: 'critical' as const },
        { message: 'Usure prématurée suspectée', type: 'warning' as const },
      ];

      return Array.from({ length: Math.floor(Math.random() * 4) + 1 }, (_, i) => {
        const alert = alertMessages[Math.floor(Math.random() * alertMessages.length)];
        return {
          id: `alert-${i}`,
          ...alert,
          machine: `Machine ${Math.floor(Math.random() * 6) + 1}`,
          timestamp: new Date(Date.now() - Math.random() * 3600000),
          value: Math.random() * 100
        };
      });
    };

    setAlerts(generateAlerts());
    const interval = setInterval(() => {
      setAlerts(generateAlerts());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-white/80 backdrop-blur-md rounded-xl p-6 shadow-lg border border-gray-200/50">
      <div className="flex items-center space-x-2 mb-6">
        <AlertTriangle className="w-5 h-5 text-yellow-500" />
        <h3 className="text-lg font-semibold text-gray-900">Alertes Actives</h3>
        <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-medium">
          {alerts.length}
        </span>
      </div>

      <div className="space-y-3">
        {alerts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <TrendingUp className="w-8 h-8 mx-auto mb-2 text-green-500" />
            <p>Aucune alerte active</p>
            <p className="text-sm">Tous les systèmes fonctionnent normalement</p>
          </div>
        ) : (
          alerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-4 rounded-lg border-l-4 ${
                alert.type === 'critical'
                  ? 'bg-red-50 border-red-500'
                  : 'bg-yellow-50 border-yellow-500'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className={`font-medium ${
                    alert.type === 'critical' ? 'text-red-800' : 'text-yellow-800'
                  }`}>
                    {alert.message}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">{alert.machine}</p>
                  <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>{alert.timestamp.toLocaleTimeString()}</span>
                    </div>
                    <span>Valeur: {alert.value.toFixed(1)}</span>
                  </div>
                </div>
                <div className={`px-2 py-1 rounded text-xs font-medium ${
                  alert.type === 'critical'
                    ? 'bg-red-100 text-red-700'
                    : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {alert.type === 'critical' ? 'Critique' : 'Attention'}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
