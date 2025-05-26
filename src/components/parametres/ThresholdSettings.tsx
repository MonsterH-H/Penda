
import { useState } from 'react';
import { Save, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

interface ThresholdValues {
  temperature: { min: number; max: number; critical: number };
  pressure: { min: number; max: number; critical: number };
  vibration: { min: number; max: number; critical: number };
  current: { min: number; max: number; critical: number };
  voltage: { min: number; max: number; critical: number };
}

export const ThresholdSettings = () => {
  const { toast } = useToast();
  const [thresholds, setThresholds] = useState<ThresholdValues>({
    temperature: { min: 60, max: 80, critical: 90 },
    pressure: { min: 1.8, max: 3.0, critical: 3.5 },
    vibration: { min: 0.3, max: 1.0, critical: 1.5 },
    current: { min: 10, max: 50, critical: 60 },
    voltage: { min: 380, max: 420, critical: 450 }
  });

  const [hasChanges, setHasChanges] = useState(false);

  const handleThresholdChange = (metric: keyof ThresholdValues, type: 'min' | 'max' | 'critical', value: number) => {
    setThresholds(prev => ({
      ...prev,
      [metric]: {
        ...prev[metric],
        [type]: value
      }
    }));
    setHasChanges(true);
  };

  const handleSave = () => {
    // Simulation de sauvegarde
    setTimeout(() => {
      setHasChanges(false);
      toast({
        title: "Paramètres sauvegardés",
        description: "Les nouveaux seuils ont été appliqués avec succès",
      });
    }, 500);
  };

  const handleReset = () => {
    setThresholds({
      temperature: { min: 60, max: 80, critical: 90 },
      pressure: { min: 1.8, max: 3.0, critical: 3.5 },
      vibration: { min: 0.3, max: 1.0, critical: 1.5 },
      current: { min: 10, max: 50, critical: 60 },
      voltage: { min: 380, max: 420, critical: 450 }
    });
    setHasChanges(true);
  };

  const thresholdConfigs = [
    {
      key: 'temperature' as keyof ThresholdValues,
      label: 'Température',
      unit: '°C',
      description: 'Seuils de température pour les machines'
    },
    {
      key: 'pressure' as keyof ThresholdValues,
      label: 'Pression',
      unit: 'bar',
      description: 'Seuils de pression hydraulique'
    },
    {
      key: 'vibration' as keyof ThresholdValues,
      label: 'Vibration',
      unit: 'mm/s',
      description: 'Seuils de vibration mécanique'
    },
    {
      key: 'current' as keyof ThresholdValues,
      label: 'Courant',
      unit: 'A',
      description: 'Seuils de consommation électrique'
    },
    {
      key: 'voltage' as keyof ThresholdValues,
      label: 'Tension',
      unit: 'V',
      description: 'Seuils de tension électrique'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Configuration des Seuils</h3>
          <p className="text-sm text-gray-600">Définissez les valeurs limites pour les alertes automatiques</p>
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
        {thresholdConfigs.map((config) => (
          <div key={config.key} className="bg-gray-50 rounded-lg p-6">
            <div className="mb-4">
              <h4 className="font-medium text-gray-900">{config.label}</h4>
              <p className="text-sm text-gray-600">{config.description}</p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Minimum ({config.unit})
                  </label>
                  <Input
                    type="number"
                    value={thresholds[config.key].min}
                    onChange={(e) => handleThresholdChange(config.key, 'min', parseFloat(e.target.value))}
                    step={config.key === 'pressure' || config.key === 'vibration' ? '0.1' : '1'}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Maximum ({config.unit})
                  </label>
                  <Input
                    type="number"
                    value={thresholds[config.key].max}
                    onChange={(e) => handleThresholdChange(config.key, 'max', parseFloat(e.target.value))}
                    step={config.key === 'pressure' || config.key === 'vibration' ? '0.1' : '1'}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Critique ({config.unit})
                  </label>
                  <Input
                    type="number"
                    value={thresholds[config.key].critical}
                    onChange={(e) => handleThresholdChange(config.key, 'critical', parseFloat(e.target.value))}
                    step={config.key === 'pressure' || config.key === 'vibration' ? '0.1' : '1'}
                    className="border-red-200 focus:border-red-500"
                  />
                </div>
              </div>

              {/* Visualisation des seuils */}
              <div className="relative h-6 bg-gradient-to-r from-green-200 via-yellow-200 to-red-200 rounded-full">
                <div 
                  className="absolute h-6 w-1 bg-green-600 rounded-full"
                  style={{ left: '20%' }}
                  title={`Min: ${thresholds[config.key].min}${config.unit}`}
                />
                <div 
                  className="absolute h-6 w-1 bg-yellow-600 rounded-full"
                  style={{ left: '60%' }}
                  title={`Max: ${thresholds[config.key].max}${config.unit}`}
                />
                <div 
                  className="absolute h-6 w-1 bg-red-600 rounded-full"
                  style={{ left: '80%' }}
                  title={`Critique: ${thresholds[config.key].critical}${config.unit}`}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {hasChanges && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <Save className="w-5 h-5 text-yellow-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-800">
                Vous avez des modifications non sauvegardées. N'oubliez pas de sauvegarder vos changements.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
