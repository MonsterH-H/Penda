import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useHistoricalData } from '@/hooks/data/useHistoricalData';
import { useState, useEffect } from 'react';

interface HistoricalChartsProps {
  startDate: Date;
  endDate: Date;
  machineId?: string;
  selectedMetrics: string[];
  aggregation?: 'none' | 'hourly' | 'daily' | 'weekly';
}

export const HistoricalCharts = ({ 
  startDate, 
  endDate, 
  machineId, 
  selectedMetrics, 
  aggregation = 'none' 
}: HistoricalChartsProps) => {
  // Utiliser le hook pour récupérer les données historiques
  const { data, isLoading, error } = useHistoricalData({
    startDate,
    endDate,
    machineId,
    metrics: selectedMetrics,
    aggregation
  });

  // Afficher un indicateur de chargement si nécessaire
  if (isLoading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Chargement des données...</span>
      </div>
    );
  }
  
  // Afficher un message d'erreur si nécessaire
  if (error) {
    // Déterminer le message d'erreur à afficher
    let errorMessage = 'Une erreur inconnue est survenue';
    
    if (typeof error === 'string') {
      errorMessage = error;
    } else if (error && typeof error === 'object' && 'message' in error) {
      errorMessage = error.message as string;
    }
    
    return (
      <div className="h-96 flex items-center justify-center">
        <div className="p-4 bg-red-50 text-red-600 rounded-lg max-w-md">
          <p className="font-medium">Erreur lors du chargement des données</p>
          <p className="text-sm mt-1">{errorMessage}</p>
        </div>
      </div>
    );
  }
  
  // Afficher un message si aucune donnée n'est disponible
  if (!data || data.length === 0) {
    return (
      <div className="h-96 flex items-center justify-center">
        <div className="p-4 bg-amber-50 text-amber-600 rounded-lg max-w-md">
          <p className="font-medium">Aucune donnée disponible</p>
          <p className="text-sm mt-1">Essayez de modifier les filtres ou la période sélectionnée.</p>
        </div>
      </div>
    );
  }

  const metricColors = {
    temperature: '#ef4444',
    pressure: '#3b82f6',
    vibration: '#8b5cf6',
    riskScore: '#f59e0b'
  };

  const metricLabels = {
    temperature: 'Température (°C)',
    pressure: 'Pression (bar)',
    vibration: 'Vibration (mm/s)',
    riskScore: 'Score de Risque (%)'
  };

  return (
    <div className="h-96">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="timestamp" 
            stroke="#6b7280" 
            fontSize={12}
            tickFormatter={(value) => new Date(value).toLocaleTimeString()}
          />
          <YAxis stroke="#6b7280" fontSize={12} />
          <Tooltip 
            labelFormatter={(value) => new Date(value).toLocaleString()}
            contentStyle={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.95)', 
              border: 'none', 
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }} 
          />
          <Legend />
          {selectedMetrics.map((metric) => (
            <Line
              key={metric}
              type="monotone"
              dataKey={metric}
              stroke={metricColors[metric as keyof typeof metricColors]}
              strokeWidth={2}
              dot={false}
              name={metricLabels[metric as keyof typeof metricLabels]}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};