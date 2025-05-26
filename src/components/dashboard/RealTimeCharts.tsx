
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { useRealTimeData } from '@/hooks/data/useRealTimeData';
import { API_CONFIG } from '@/config/api.config';

interface DataPoint {
  time: string;
  timestamp: string;
  machine: string;
  temperature: number;
  pressure: number;
  vibration: number;
  rotation: number;
  current: number;
  voltage: number;
  mlScore: number;
}

interface RealTimeChartsProps {
  machineId?: string;
}

export const RealTimeCharts = ({ machineId }: RealTimeChartsProps = {}) => {
  // Utiliser le hook pour récupérer les données en temps réel
  const { data, isLoading, error } = useRealTimeData({
    machineId,
    refreshInterval: 5000, // 5 secondes par défaut
    enabled: true
  });

  // Afficher un indicateur de chargement si nécessaire
  if (isLoading && data.length === 0) {
    return (
      <div className="bg-white/80 backdrop-blur-md rounded-xl p-6 shadow-lg border border-gray-200/50">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Données Temps Réel</h3>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Chargement des données...</span>
        </div>
      </div>
    );
  }
  
  // Afficher un message d'erreur si nécessaire
  if (error) {
    return (
      <div className="bg-white/80 backdrop-blur-md rounded-xl p-6 shadow-lg border border-gray-200/50">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Données Temps Réel</h3>
        <div className="p-4 bg-red-50 text-red-600 rounded-lg">
          <p>Erreur lors du chargement des données: {error}</p>
          <p className="text-sm mt-2">Des données de démonstration sont affichées à la place.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/80 backdrop-blur-md rounded-xl p-6 shadow-lg border border-gray-200/50">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Données Temps Réel</h3>
      
      <div className="space-y-8">
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">Température & Pression</h4>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="time" stroke="#6b7280" fontSize={12} />
              <YAxis stroke="#6b7280" fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.9)', 
                  border: 'none', 
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }} 
              />
              <Line 
                type="monotone" 
                dataKey="temperature" 
                stroke="#ef4444" 
                strokeWidth={2}
                dot={false}
                name="Température (°C)"
              />
              <Line 
                type="monotone" 
                dataKey="pressure" 
                stroke="#3b82f6" 
                strokeWidth={2}
                dot={false}
                name="Pression (bar)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">Score de Risque ML</h4>
          <ResponsiveContainer width="100%" height={150}>
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="time" stroke="#6b7280" fontSize={12} />
              <YAxis stroke="#6b7280" fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.9)', 
                  border: 'none', 
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }} 
              />
              <Area 
                type="monotone" 
                dataKey="mlScore" 
                stroke="#8b5cf6" 
                fill="url(#mlGradient)"
                strokeWidth={2}
                name="Score de Risque (%)"
              />
              <defs>
                <linearGradient id="mlGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                </linearGradient>
              </defs>
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
