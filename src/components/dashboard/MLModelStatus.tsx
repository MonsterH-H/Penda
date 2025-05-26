
import { Brain, TrendingUp, TrendingDown, RefreshCw, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useMLModelStatus } from '@/hooks/data/useMLModel';
import { MLModelStatus as MLModelStatusType } from '@/types/prediction';

export const MLModelStatus = () => {
  // Utiliser le hook pour récupérer l'état du modèle ML
  const { modelStatus, isLoading, isTraining, error, trainModel } = useMLModelStatus();
  
  // Déterminer le statut du modèle
  const getModelStatus = (): 'active' | 'training' | 'error' => {
    if (isTraining) return 'training';
    if (error) return 'error';
    return 'active';
  };
  
  const status = getModelStatus();
  
  // Gérer le ré-entraînement du modèle
  const handleRetrain = async () => {
    try {
      await trainModel();
    } catch (error) {
      console.error('Erreur lors du ré-entraînement du modèle:', error);
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'active':
        return 'from-green-500 to-emerald-500';
      case 'training':
        return 'from-blue-500 to-cyan-500';
      case 'error':
        return 'from-red-500 to-rose-500';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'active':
        return 'Opérationnel';
      case 'training':
        return 'Entraînement...';
      case 'error':
        return 'Erreur';
    }
  };

  // Afficher un indicateur de chargement si nécessaire
  if (isLoading && !modelStatus) {
    return (
      <div className="bg-white/80 backdrop-blur-md rounded-xl p-6 shadow-lg border border-gray-200/50">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Modèle ML</h3>
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Chargement des données...</span>
        </div>
      </div>
    );
  }

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
          disabled={isTraining}
          size="sm"
          className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isTraining ? 'animate-spin' : ''}`} />
          {isTraining ? 'Entraînement...' : 'Ré-entraîner'}
        </Button>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          {
            modelStatus ? [
            { label: 'Précision', value: modelStatus.accuracy, key: 'accuracy' },
            { label: 'Précision', value: modelStatus.precision, key: 'precision' },
            { label: 'Rappel', value: modelStatus.recall, key: 'recall' },
            { label: 'F1-Score', value: modelStatus.f1Score, key: 'f1Score' },
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
          )) : (
            <div className="col-span-2 p-4 bg-gray-50 rounded-lg text-gray-500">
              <AlertTriangle className="w-5 h-5 text-amber-500 inline mr-2" />
              Données du modèle non disponibles
            </div>
          )}
        </div>

        <div className="border-t pt-4">
          <div className="text-sm text-gray-600">
            {modelStatus ? (
              <>Dernier entraînement: {modelStatus.lastTrained.toLocaleDateString()} à {modelStatus.lastTrained.toLocaleTimeString()}</>
            ) : (
              <>Dernier entraînement: Non disponible</>
            )}
          </div>
          <div className="mt-2">
            <div className="text-xs text-gray-500 mb-1">Performance globale</div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${modelStatus ? modelStatus.f1Score : 0}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
