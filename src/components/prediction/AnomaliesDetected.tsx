
import { Clock, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

interface Anomaly {
  id: string;
  timestamp: Date;
  machine: string;
  riskScore: number;
  factors: string[];
  severity: 'low' | 'medium' | 'high' | 'critical';
  reconstructionError: number;
}

interface AnomaliesDetectedProps {
  anomalies: Anomaly[];
  selectedAnomaly: Anomaly | null;
  onSelectAnomaly: (anomaly: Anomaly) => void;
}

export const AnomaliesDetected = ({ anomalies, selectedAnomaly, onSelectAnomaly }: AnomaliesDetectedProps) => {
  const getSeverityIcon = (severity: Anomaly['severity']) => {
    switch (severity) {
      case 'low':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'medium':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'high':
        return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      case 'critical':
        return <XCircle className="w-4 h-4 text-red-500" />;
    }
  };

  const getSeverityColor = (severity: Anomaly['severity']) => {
    switch (severity) {
      case 'low':
        return 'border-green-200 bg-green-50';
      case 'medium':
        return 'border-yellow-200 bg-yellow-50';
      case 'high':
        return 'border-orange-200 bg-orange-50';
      case 'critical':
        return 'border-red-200 bg-red-50';
    }
  };

  const getSeverityText = (severity: Anomaly['severity']) => {
    switch (severity) {
      case 'low':
        return 'Faible';
      case 'medium':
        return 'Moyen';
      case 'high':
        return 'Élevé';
      case 'critical':
        return 'Critique';
    }
  };

  if (anomalies.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500" />
        <p className="text-lg font-medium">Aucune anomalie détectée</p>
        <p className="text-sm">Le système fonctionne normalement</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 max-h-96 overflow-y-auto">
      {anomalies.map((anomaly) => (
        <div
          key={anomaly.id}
          onClick={() => onSelectAnomaly(anomaly)}
          className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
            getSeverityColor(anomaly.severity)
          } ${
            selectedAnomaly?.id === anomaly.id 
              ? 'ring-2 ring-blue-500 ring-opacity-50' 
              : 'hover:shadow-md'
          }`}
        >
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center space-x-2">
              {getSeverityIcon(anomaly.severity)}
              <span className="font-medium text-gray-900">{anomaly.machine}</span>
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                {getSeverityText(anomaly.severity)}
              </span>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-gray-900">
                {anomaly.riskScore.toFixed(0)}%
              </div>
              <div className="text-xs text-gray-500">Risque</div>
            </div>
          </div>

          <div className="flex items-center space-x-4 text-xs text-gray-500 mb-2">
            <div className="flex items-center space-x-1">
              <Clock className="w-3 h-3" />
              <span>{anomaly.timestamp.toLocaleString()}</span>
            </div>
            <span>Erreur: {anomaly.reconstructionError.toFixed(3)}</span>
          </div>

          <div className="flex flex-wrap gap-1">
            {anomaly.factors.map((factor, index) => (
              <span
                key={index}
                className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full"
              >
                {factor}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
