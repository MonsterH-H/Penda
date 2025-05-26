import React from 'react';
import { AnomalyPrediction } from '@/types/prediction';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Filter } from 'lucide-react';

interface PredictionsListProps {
  predictions: AnomalyPrediction[];
  isLoading: boolean;
  onResetFilters: () => void;
}

export const PredictionsList = ({ predictions, isLoading, onResetFilters }: PredictionsListProps) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  
  if (predictions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <p className="text-gray-500 mb-4">Aucune pru00e9diction ne correspond aux critu00e8res de recherche</p>
        <Button 
          variant="outline" 
          onClick={onResetFilters}
        >
          <Filter className="w-4 h-4 mr-2" />
          Ru00e9initialiser les filtres
        </Button>
      </div>
    );
  }
  
  return (
    <div className="overflow-auto max-h-96">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date/Heure</th>
            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Machine</th>
            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Risque</th>
            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Su00e9vu00e9ritu00e9</th>
            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Facteurs</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {predictions.map((prediction) => (
            <tr key={prediction.id}>
              <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-500">
                {prediction.timestamp.toLocaleString()}
              </td>
              <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-500">
                {prediction.machine}
              </td>
              <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-500">
                {prediction.riskScore.toFixed(1)}%
              </td>
              <td className="px-3 py-3 whitespace-nowrap text-sm">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                  ${prediction.severity === 'low' ? 'bg-blue-100 text-blue-800' : ''}
                  ${prediction.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' : ''}
                  ${prediction.severity === 'high' ? 'bg-orange-100 text-orange-800' : ''}
                  ${prediction.severity === 'critical' ? 'bg-red-100 text-red-800' : ''}
                `}>
                  {prediction.severity}
                </span>
              </td>
              <td className="px-3 py-3 text-sm text-gray-500">
                <div className="flex flex-wrap gap-1">
                  {prediction.factors.slice(0, 2).map((factor, i) => (
                    <Badge key={i} variant="outline" className="text-xs">{factor}</Badge>
                  ))}
                  {prediction.factors.length > 2 && (
                    <Badge variant="outline" className="text-xs">+{prediction.factors.length - 2}</Badge>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
