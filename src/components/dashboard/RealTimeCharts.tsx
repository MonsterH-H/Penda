
import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

interface DataPoint {
  time: string;
  temperature: number;
  pressure: number;
  vibration: number;
  mlScore: number;
}

export const RealTimeCharts = () => {
  const [data, setData] = useState<DataPoint[]>([]);

  useEffect(() => {
    const generateDataPoint = (): DataPoint => ({
      time: new Date().toLocaleTimeString(),
      temperature: 65 + Math.random() * 15,
      pressure: 2.0 + Math.random() * 1.0,
      vibration: 0.5 + Math.random() * 0.8,
      mlScore: Math.random() * 100
    });

    // Initialiser avec quelques points
    const initialData = Array.from({ length: 10 }, generateDataPoint);
    setData(initialData);

    const interval = setInterval(() => {
      setData(prevData => {
        const newData = [...prevData.slice(-9), generateDataPoint()];
        return newData;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

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
