
import { Brain, RefreshCw, TrendingUp, TrendingDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MLModelStatus {
  isTraining: boolean;
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  lastTrained: Date;
}

interface MLModelControlProps {
  modelStatus: MLModelStatus;
  onRetrain: () => void;
}

export const MLModelControl = ({ modelStatus, onRetrain }: MLModelControlProps) => {
  const metrics = [
    { label: 'Précision', value: modelStatus.accuracy, key: 'accuracy' },
    { label: 'Precision', value: modelStatus.precision, key: 'precision' },
    { label: 'Rappel', value: modelStatus.recall, key: 'recall' },
    { label: 'F1-Score', value: modelStatus.f1Score, key: 'f1Score' },
  ];

  return (
    <div className="space-y-6">
      {/* Status et contrôles */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
            modelStatus.isTraining 
              ? 'bg-gradient-to-r from-blue-500 to-cyan-500' 
              : 'bg-gradient-to-r from-green-500 to-emerald-500'
          }`}>
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <h4 className="font-semibold text-gray-900">Modèle Autoencoder</h4>
            <p className="text-sm text-gray-600">
              {modelStatus.isTraining ? 'Entraînement en cours...' : 'Modèle opérationnel'}
            </p>
          </div>
        </div>
        <Button
          onClick={onRetrain}
          disabled={modelStatus.isTraining}
          className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${modelStatus.isTraining ? 'animate-spin' : ''}`} />
          {modelStatus.isTraining ? 'Entraînement...' : 'Ré-entraîner'}
        </Button>
      </div>

      {/* Métriques de performance */}
      <div>
        <h5 className="text-sm font-medium text-gray-700 mb-3">Métriques de Performance</h5>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {metrics.map((metric) => (
            <div key={metric.key} className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">{metric.label}</span>
                <div className="flex items-center space-x-1">
                  {Math.random() > 0.5 ? (
                    <TrendingUp className="w-3 h-3 text-green-500" />
                  ) : (
                    <TrendingDown className="w-3 h-3 text-red-500" />
                  )}
                </div>
              </div>
              <div className="text-xl font-bold text-gray-900">
                {metric.value.toFixed(1)}%
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                <div 
                  className="bg-gradient-to-r from-purple-500 to-indigo-500 h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${metric.value}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Informations d'entraînement */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Dernier entraînement:</span>
            <div className="font-medium text-gray-900">
              {modelStatus.lastTrained.toLocaleDateString()} à {modelStatus.lastTrained.toLocaleTimeString()}
            </div>
          </div>
          <div>
            <span className="text-gray-600">Performance globale:</span>
            <div className="flex items-center space-x-2">
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${modelStatus.f1Score}%` }}
                ></div>
              </div>
              <span className="font-medium text-gray-900">{modelStatus.f1Score.toFixed(1)}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Progress bar pendant l'entraînement */}
      {modelStatus.isTraining && (
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-blue-900">Entraînement en cours...</span>
            <span className="text-sm text-blue-600">Epoch 45/100</span>
          </div>
          <div className="w-full bg-blue-200 rounded-full h-2">
            <div className="bg-blue-600 h-2 rounded-full transition-all duration-1000 animate-pulse" style={{ width: '45%' }}></div>
          </div>
          <div className="text-xs text-blue-600 mt-1">
            Temps estimé restant: 2 min 30s
          </div>
        </div>
      )}
    </div>
  );
};
