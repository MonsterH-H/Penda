
import { Thermometer, Gauge, Activity, AlertTriangle } from 'lucide-react';

interface Anomaly {
  id: string;
  timestamp: Date;
  machine: string;
  riskScore: number;
  factors: string[];
  severity: 'low' | 'medium' | 'high' | 'critical';
  reconstructionError: number;
  rawData: {
    temperature: number;
    pressure: number;
    vibration: number;
  };
}

interface AnomalyDetailsProps {
  anomaly: Anomaly | null;
}

export const AnomalyDetails = ({ anomaly }: AnomalyDetailsProps) => {
  if (!anomaly) {
    return (
      <div className="text-center py-8 text-gray-500">
        <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-gray-400" />
        <p>Sélectionnez une anomalie pour voir les détails</p>
      </div>
    );
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'high': return 'text-orange-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const metrics = [
    {
      label: 'Température',
      value: `${anomaly.rawData.temperature.toFixed(1)}°C`,
      icon: Thermometer,
      normal: '60-80°C',
      status: anomaly.rawData.temperature > 80 ? 'warning' : 'normal'
    },
    {
      label: 'Pression',
      value: `${anomaly.rawData.pressure.toFixed(2)} bar`,
      icon: Gauge,
      normal: '1.8-3.0 bar',
      status: anomaly.rawData.pressure > 3.0 || anomaly.rawData.pressure < 1.8 ? 'warning' : 'normal'
    },
    {
      label: 'Vibration',
      value: `${anomaly.rawData.vibration.toFixed(2)} mm/s`,
      icon: Activity,
      normal: '0.3-1.0 mm/s',
      status: anomaly.rawData.vibration > 1.0 ? 'warning' : 'normal'
    }
  ];

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div>
        <h4 className="font-semibold text-gray-900 mb-2">{anomaly.machine}</h4>
        <div className="text-sm text-gray-600 space-y-1">
          <p>{anomaly.timestamp.toLocaleString()}</p>
          <p className={`font-medium ${getSeverityColor(anomaly.severity)}`}>
            Sévérité: {anomaly.severity.charAt(0).toUpperCase() + anomaly.severity.slice(1)}
          </p>
        </div>
      </div>

      {/* Score de risque */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Score de Risque</span>
          <span className="text-lg font-bold text-gray-900">{anomaly.riskScore.toFixed(0)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${
              anomaly.riskScore > 75 ? 'bg-red-500' : 
              anomaly.riskScore > 50 ? 'bg-yellow-500' : 'bg-green-500'
            }`}
            style={{ width: `${anomaly.riskScore}%` }}
          ></div>
        </div>
      </div>

      {/* Métriques */}
      <div>
        <h5 className="text-sm font-medium text-gray-700 mb-3">Données Capteurs</h5>
        <div className="space-y-3">
          {metrics.map((metric, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <metric.icon className={`w-4 h-4 ${metric.status === 'warning' ? 'text-red-500' : 'text-gray-500'}`} />
                <div>
                  <div className="text-sm font-medium text-gray-900">{metric.label}</div>
                  <div className="text-xs text-gray-500">Normal: {metric.normal}</div>
                </div>
              </div>
              <div className={`text-sm font-medium ${metric.status === 'warning' ? 'text-red-600' : 'text-gray-900'}`}>
                {metric.value}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Facteurs contributifs */}
      <div>
        <h5 className="text-sm font-medium text-gray-700 mb-3">Facteurs Contributifs</h5>
        <div className="space-y-2">
          {anomaly.factors.map((factor, index) => (
            <div key={index} className="flex items-center space-x-2 p-2 bg-blue-50 rounded-lg">
              <AlertTriangle className="w-4 h-4 text-blue-500" />
              <span className="text-sm text-blue-700">{factor}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Erreur de reconstruction */}
      <div>
        <h5 className="text-sm font-medium text-gray-700 mb-2">Erreur de Reconstruction</h5>
        <div className="p-3 bg-purple-50 rounded-lg">
          <div className="text-lg font-bold text-purple-900">
            {anomaly.reconstructionError.toFixed(4)}
          </div>
          <div className="text-xs text-purple-600">
            Plus l'erreur est élevée, plus l'anomalie est significative
          </div>
        </div>
      </div>
    </div>
  );
};
