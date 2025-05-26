
import { useState } from 'react';
import { Save, RotateCcw, Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

interface MLConfig {
  epochs: number;
  batchSize: number;
  learningRate: number;
  validationSplit: number;
  earlyStopping: boolean;
  patience: number;
  hiddenLayers: number[];
  activationFunction: string;
  optimizer: string;
}

export const MLParameters = () => {
  const { toast } = useToast();
  const [config, setConfig] = useState<MLConfig>({
    epochs: 100,
    batchSize: 32,
    learningRate: 0.001,
    validationSplit: 0.2,
    earlyStopping: true,
    patience: 10,
    hiddenLayers: [64, 32, 16, 32, 64],
    activationFunction: 'relu',
    optimizer: 'adam'
  });

  const [hasChanges, setHasChanges] = useState(false);

  const handleConfigChange = (field: keyof MLConfig, value: any) => {
    setConfig(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleSave = () => {
    setTimeout(() => {
      setHasChanges(false);
      toast({
        title: "Paramètres ML sauvegardés",
        description: "La configuration sera appliquée au prochain entraînement",
      });
    }, 500);
  };

  const handleReset = () => {
    setConfig({
      epochs: 100,
      batchSize: 32,
      learningRate: 0.001,
      validationSplit: 0.2,
      earlyStopping: true,
      patience: 10,
      hiddenLayers: [64, 32, 16, 32, 64],
      activationFunction: 'relu',
      optimizer: 'adam'
    });
    setHasChanges(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Configuration du Modèle ML</h3>
          <p className="text-sm text-gray-600">Ajustez les paramètres de l'autoencoder pour la détection d'anomalies</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" onClick={handleReset}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Réinitialiser
          </Button>
          <Button onClick={handleSave} disabled={!hasChanges}>
            <Save className="w-4 h-4 mr-2" />
            Sauvegarder
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Paramètres d'entraînement */}
        <div className="bg-gray-50 rounded-lg p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Brain className="w-5 h-5 text-blue-500" />
            <h4 className="font-medium text-gray-900">Paramètres d'Entraînement</h4>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Époques
                </label>
                <Input
                  type="number"
                  value={config.epochs}
                  onChange={(e) => handleConfigChange('epochs', parseInt(e.target.value))}
                  min="10"
                  max="500"
                />
                <p className="text-xs text-gray-500 mt-1">Nombre d'itérations d'entraînement</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Taille de batch
                </label>
                <Input
                  type="number"
                  value={config.batchSize}
                  onChange={(e) => handleConfigChange('batchSize', parseInt(e.target.value))}
                  min="1"
                  max="128"
                />
                <p className="text-xs text-gray-500 mt-1">Échantillons traités par batch</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Taux d'apprentissage
                </label>
                <Input
                  type="number"
                  value={config.learningRate}
                  onChange={(e) => handleConfigChange('learningRate', parseFloat(e.target.value))}
                  step="0.0001"
                  min="0.0001"
                  max="0.1"
                />
                <p className="text-xs text-gray-500 mt-1">Vitesse d'adaptation du modèle</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Validation (%)
                </label>
                <Input
                  type="number"
                  value={config.validationSplit * 100}
                  onChange={(e) => handleConfigChange('validationSplit', parseFloat(e.target.value) / 100)}
                  min="10"
                  max="40"
                />
                <p className="text-xs text-gray-500 mt-1">Pourcentage pour validation</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={config.earlyStopping}
                    onChange={(e) => handleConfigChange('earlyStopping', e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm text-gray-700">Arrêt précoce</span>
                </label>
                <p className="text-xs text-gray-500 mt-1">Stoppe si pas d'amélioration</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Patience
                </label>
                <Input
                  type="number"
                  value={config.patience}
                  onChange={(e) => handleConfigChange('patience', parseInt(e.target.value))}
                  min="5"
                  max="50"
                  disabled={!config.earlyStopping}
                />
                <p className="text-xs text-gray-500 mt-1">Époques d'attente avant arrêt</p>
              </div>
            </div>
          </div>
        </div>

        {/* Architecture du modèle */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h4 className="font-medium text-gray-900 mb-4">Architecture du Modèle</h4>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Fonction d'activation
              </label>
              <select
                value={config.activationFunction}
                onChange={(e) => handleConfigChange('activationFunction', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="relu">ReLU</option>
                <option value="tanh">Tanh</option>
                <option value="sigmoid">Sigmoid</option>
                <option value="elu">ELU</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Optimiseur
              </label>
              <select
                value={config.optimizer}
                onChange={(e) => handleConfigChange('optimizer', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="adam">Adam</option>
                <option value="sgd">SGD</option>
                <option value="rmsprop">RMSprop</option>
                <option value="adagrad">Adagrad</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">
                Architecture des couches cachées
              </label>
              <div className="grid grid-cols-5 gap-1">
                {config.hiddenLayers.map((neurons, index) => (
                  <Input
                    key={index}
                    type="number"
                    value={neurons}
                    onChange={(e) => {
                      const newLayers = [...config.hiddenLayers];
                      newLayers[index] = parseInt(e.target.value);
                      handleConfigChange('hiddenLayers', newLayers);
                    }}
                    min="8"
                    max="128"
                    className="text-center"
                  />
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-1">Nombre de neurones par couche (encodeur → décodeur)</p>
            </div>

            {/* Visualisation de l'architecture */}
            <div className="mt-4">
              <p className="text-xs font-medium text-gray-700 mb-2">Aperçu de l'architecture:</p>
              <div className="flex items-center justify-center space-x-2 text-xs">
                <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">Input (5)</span>
                {config.hiddenLayers.map((neurons, index) => (
                  <div key={index} className="flex items-center space-x-1">
                    <span>→</span>
                    <span className={`px-2 py-1 rounded ${
                      index < config.hiddenLayers.length / 2 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-purple-100 text-purple-700'
                    }`}>
                      {neurons}
                    </span>
                  </div>
                ))}
                <span>→</span>
                <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">Output (5)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {hasChanges && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <Save className="w-5 h-5 text-yellow-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-800">
                Vous avez des modifications non sauvegardées. Ces paramètres seront appliqués au prochain entraînement.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
