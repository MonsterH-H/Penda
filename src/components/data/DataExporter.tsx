import React from 'react';
import { Button } from '@/components/ui/button';
import { FileDown, Save } from 'lucide-react';

interface DataExporterProps {
  onExportData: () => void;
  predictionsCount: number;
  metrics: {
    accuracy: number;
    precision: number;
    recall: number;
    f1Score: number;
    loss: number;
  };
  onExportMetrics: () => void;
}

export const DataExporter = ({ 
  onExportData, 
  predictionsCount, 
  metrics, 
  onExportMetrics 
}: DataExporterProps) => {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-sm font-medium">Exporter les prédictions</h3>
        <Button 
          onClick={onExportData} 
          disabled={predictionsCount === 0}
          className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
        >
          <FileDown className="w-4 h-4 mr-2" />
          Exporter en CSV
        </Button>
        <p className="text-xs text-gray-500">
          {predictionsCount > 0 
            ? `${predictionsCount} prédictions disponibles pour export` 
            : "Aucune prédiction disponible pour export"}
        </p>
      </div>
      
      <div className="space-y-4">
        <h3 className="text-sm font-medium">Métriques du modèle</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-xs text-gray-500">Précision</p>
            <p className="text-lg font-semibold">{metrics.accuracy.toFixed(1)}%</p>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-xs text-gray-500">Score F1</p>
            <p className="text-lg font-semibold">{metrics.f1Score.toFixed(1)}%</p>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-xs text-gray-500">Rappel</p>
            <p className="text-lg font-semibold">{metrics.recall.toFixed(1)}%</p>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-xs text-gray-500">Perte</p>
            <p className="text-lg font-semibold">{metrics.loss.toFixed(4)}</p>
          </div>
        </div>
        <Button 
          variant="outline"
          onClick={onExportMetrics}
          className="w-full sm:w-auto"
        >
          <Save className="w-4 h-4 mr-2" />
          Exporter les métriques
        </Button>
      </div>
    </div>
  );
};
