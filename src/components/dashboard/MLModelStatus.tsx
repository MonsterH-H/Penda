
import { useState, useEffect } from 'react';
import { Brain, TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MLMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  lastTrained: Date;
  status: 'active' | 'training' | 'error';
}

export const MLModelStatus = () => {
  const [metrics, setMetrics] = useState<MLMetrics>({
    accuracy: 94.2,
    precision: 92.8,
    recall: 89.5,
    f1Score: 91.1,
    lastTrained: new Date(Date.now() - 3600000 * 2),
    status: 'active'
  });

  const [isRetraining, setIsRetraining] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        accuracy: 94 + Math.random() * 4,
        precision: 92 + Math.random() * 6,
        recall: 88 + Math.random() * 8,
        f1Score: 90 + Math.random() * 5,
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleRetrain = () => {
    setIsRetraining(true);
    setMetrics(prev => ({ ...prev, status: 'training' }));
    
    setTimeout(() => {
      setIsRetraining(false);
      setMetrics(prev => ({
        ...prev,
        status: 'active',
        lastTrained: new Date(),
        accuracy: 95 + Math.random() * 3,
        precision: 94 + Math.random() * 4,
        recall: 91 + Math.random() * 6,
        f1Score: 93 + Math.random() * 4,
      }));
    }, 3000);
  };

  const getStatusColor = () => {
    switch (metrics.status) {
      case 'active':
        return 'from-green-500 to-emerald-500';
      case 'training':
        return 'from-blue-500 to-cyan-500';
      case 'error':
        return 'from-red-500 to-rose-500';
    }
  };

  const getStatusText = () => {
    switch (metrics.status) {
      case 'active':
        return 'Opérationnel';
      case 'training':
        return 'Entraînement...';
      case 'error':
        return 'Erreur';
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-md rounded-xl p-6 shadow-lg border border-gray-200/50">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className={`w-10 h-10 bg-gradient-to-r ${getStatusColor()} rounded-lg flex items-center justify-center`}>
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Modèle ML</h3>
            <p className="text-sm text-gray-600">{getStatusText()}</p>
          </div>
        </div>
        <Button
          onClick={handleRetrain}
          disabled={isRetraining}
          size="sm"
          className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isRetraining ? 'animate-spin' : ''}`} />
          {isRetraining ? 'Entraînement...' : 'Ré-entraîner'}
        </Button>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: 'Précision', value: metrics.accuracy, key: 'accuracy' },
            { label: 'Précision', value: metrics.precision, key: 'precision' },
            { label: 'Rappel', value: metrics.recall, key: 'recall' },
            { label: 'F1-Score', value: metrics.f1Score, key: 'f1Score' },
          ].map((metric) => (
            <div key={metric.key} className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-gray-600">{metric.label}</span>
                <div className="flex items-center space-x-1">
                  {Math.random() > 0.5 ? (
                    <TrendingUp className="w-3 h-3 text-green-500" />
                  ) : (
                    <TrendingDown className="w-3 h-3 text-red-500" />
                  )}
                </div>
              </div>
              <div className="text-lg font-bold text-gray-900">
                {metric.value.toFixed(1)}%
              </div>
            </div>
          ))}
        </div>

        <div className="border-t pt-4">
          <div className="text-sm text-gray-600">
            Dernier entraînement: {metrics.lastTrained.toLocaleDateString()} à {metrics.lastTrained.toLocaleTimeString()}
          </div>
          <div className="mt-2">
            <div className="text-xs text-gray-500 mb-1">Performance globale</div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${metrics.f1Score}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
