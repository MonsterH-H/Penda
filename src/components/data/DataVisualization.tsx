/**
 * Composant pour la visualisation des donnu00e9es ru00e9elles importu00e9es
 */

import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TimestampedSensorData } from '@/api/sensorDataService';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

/**
 * Props pour le composant DataVisualization
 */
interface DataVisualizationProps {
  data: TimestampedSensorData[];
}

/**
 * Composant pour la visualisation des donnu00e9es ru00e9elles importu00e9es
 */
export const DataVisualization = ({ data }: DataVisualizationProps) => {
  // u00c9tat pour les mu00e9triques su00e9lectionnu00e9es
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>(['temperature', 'pressure', 'vibration']);
  
  // Formater les donnu00e9es pour l'affichage
  const formattedData = data.map(item => ({
    ...item,
    timestamp: new Date(item.timestamp).toLocaleString(),
  }));
  
  // Toutes les mu00e9triques disponibles
  const availableMetrics = [
    { key: 'temperature', label: 'Tempu00e9rature (u00b0C)', color: '#ef4444' },
    { key: 'pressure', label: 'Pression (bar)', color: '#3b82f6' },
    { key: 'vibration', label: 'Vibration (mm/s)', color: '#8b5cf6' },
    { key: 'rotation', label: 'Rotation (rpm)', color: '#f59e0b' },
    { key: 'current', label: 'Courant (A)', color: '#10b981' },
    { key: 'voltage', label: 'Tension (V)', color: '#6366f1' },
  ];
  
  // Gu00e9rer la su00e9lection des mu00e9triques
  const toggleMetric = (metric: string) => {
    if (selectedMetrics.includes(metric)) {
      setSelectedMetrics(selectedMetrics.filter(m => m !== metric));
    } else {
      setSelectedMetrics([...selectedMetrics, metric]);
    }
  };
  
  // Statistiques sur les donnu00e9es
  const getStatistics = () => {
    const stats: Record<string, { min: number; max: number; avg: number; }> = {};
    
    availableMetrics.forEach(metric => {
      const values = data.map(item => item[metric.key as keyof TimestampedSensorData] as number);
      
      stats[metric.key] = {
        min: Math.min(...values),
        max: Math.max(...values),
        avg: values.reduce((sum, val) => sum + val, 0) / values.length,
      };
    });
    
    return stats;
  };
  
  const statistics = getStatistics();
  
  // Si aucune donnu00e9e n'est disponible
  if (data.length === 0) {
    return (
      <div className="bg-white/80 backdrop-blur-md rounded-xl p-6 shadow-lg border border-gray-200/50">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Visualisation des Donnu00e9es</h3>
        <div className="p-4 bg-amber-50 text-amber-600 rounded-lg">
          <p>Aucune donnu00e9e disponible pour la visualisation.</p>
          <p className="text-sm mt-1">Importez des donnu00e9es pour les visualiser ici.</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white/80 backdrop-blur-md rounded-xl p-6 shadow-lg border border-gray-200/50">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Visualisation des Donnu00e9es</h3>
      
      <Tabs defaultValue="chart">
        <TabsList className="mb-4">
          <TabsTrigger value="chart">Graphique</TabsTrigger>
          <TabsTrigger value="stats">Statistiques</TabsTrigger>
          <TabsTrigger value="table">Tableau</TabsTrigger>
        </TabsList>
        
        {/* Onglet Graphique */}
        <TabsContent value="chart" className="space-y-4">
          {/* Su00e9lection des mu00e9triques */}
          <div className="flex flex-wrap gap-2">
            {availableMetrics.map(metric => (
              <Button
                key={metric.key}
                variant={selectedMetrics.includes(metric.key) ? 'default' : 'outline'}
                size="sm"
                onClick={() => toggleMetric(metric.key)}
                className={selectedMetrics.includes(metric.key) ? 'bg-gray-800' : ''}
              >
                {metric.label}
              </Button>
            ))}
          </div>
          
          {/* Graphique */}
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={formattedData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="timestamp" 
                  stroke="#6b7280" 
                  fontSize={12}
                />
                <YAxis stroke="#6b7280" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                    border: 'none', 
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }} 
                />
                <Legend />
                {selectedMetrics.map(metric => {
                  const metricInfo = availableMetrics.find(m => m.key === metric);
                  return (
                    <Line
                      key={metric}
                      type="monotone"
                      dataKey={metric}
                      stroke={metricInfo?.color}
                      strokeWidth={2}
                      dot={false}
                      name={metricInfo?.label}
                    />
                  );
                })}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </TabsContent>
        
        {/* Onglet Statistiques */}
        <TabsContent value="stats">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {availableMetrics.map(metric => (
              <div key={metric.key} className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">{metric.label}</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Minimum:</span>
                    <span className="font-medium">{statistics[metric.key].min.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Maximum:</span>
                    <span className="font-medium">{statistics[metric.key].max.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Moyenne:</span>
                    <span className="font-medium">{statistics[metric.key].avg.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
        
        {/* Onglet Tableau */}
        <TabsContent value="table">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Timestamp</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Machine</th>
                  {availableMetrics.map(metric => (
                    <th key={metric.key} className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                      {metric.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {formattedData.slice(0, 10).map((item, index) => (
                  <tr key={index} className="border-t border-gray-200">
                    <td className="px-4 py-2 text-sm text-gray-600">{item.timestamp}</td>
                    <td className="px-4 py-2 text-sm text-gray-600">{item.machine}</td>
                    {availableMetrics.map(metric => (
                      <td key={metric.key} className="px-4 py-2 text-sm text-gray-600">
                        {(item[metric.key as keyof typeof item] as number).toFixed(2)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            {formattedData.length > 10 && (
              <div className="mt-2 text-center text-sm text-gray-500">
                Affichage des 10 premiers enregistrements sur {formattedData.length}.
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
