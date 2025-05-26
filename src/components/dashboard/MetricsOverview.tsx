
import { useState, useEffect } from 'react';
import { Thermometer, Gauge, Activity, AlertTriangle, Cpu } from 'lucide-react';

interface Metric {
  title: string;
  value: string;
  unit: string;
  change: number;
  icon: any;
  color: string;
}

export const MetricsOverview = () => {
  const [metrics, setMetrics] = useState<Metric[]>([]);

  useEffect(() => {
    const generateMetrics = () => {
      return [
        {
          title: 'Température Moyenne',
          value: (65 + Math.random() * 10).toFixed(1),
          unit: '°C',
          change: (Math.random() - 0.5) * 4,
          icon: Thermometer,
          color: 'from-red-500 to-orange-500'
        },
        {
          title: 'Pression Système',
          value: (2.1 + Math.random() * 0.8).toFixed(2),
          unit: 'bar',
          change: (Math.random() - 0.5) * 2,
          icon: Gauge,
          color: 'from-blue-500 to-cyan-500'
        },
        {
          title: 'Machines Actives',
          value: '12',
          unit: '/15',
          change: 0,
          icon: Cpu,
          color: 'from-green-500 to-emerald-500'
        },
        {
          title: 'Vibrations',
          value: (0.8 + Math.random() * 0.4).toFixed(2),
          unit: 'mm/s',
          change: (Math.random() - 0.5) * 1,
          icon: Activity,
          color: 'from-purple-500 to-violet-500'
        },
        {
          title: 'Anomalies Détectées',
          value: Math.floor(Math.random() * 5).toString(),
          unit: 'aujourd\'hui',
          change: Math.random() * 3 - 1,
          icon: AlertTriangle,
          color: 'from-yellow-500 to-amber-500'
        }
      ];
    };

    setMetrics(generateMetrics());
    const interval = setInterval(() => {
      setMetrics(generateMetrics());
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
      {metrics.map((metric, index) => (
        <div
          key={metric.title}
          className="bg-white/80 backdrop-blur-md rounded-xl p-6 shadow-lg border border-gray-200/50 hover:shadow-xl transition-all duration-300"
        >
          <div className="flex items-center justify-between mb-4">
            <div className={`w-12 h-12 bg-gradient-to-r ${metric.color} rounded-lg flex items-center justify-center`}>
              <metric.icon className="w-6 h-6 text-white" />
            </div>
            {metric.change !== 0 && (
              <span className={`text-sm px-2 py-1 rounded-full ${
                metric.change > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
                {metric.change > 0 ? '+' : ''}{metric.change.toFixed(1)}%
              </span>
            )}
          </div>
          <div>
            <div className="flex items-baseline space-x-1">
              <span className="text-2xl font-bold text-gray-900">{metric.value}</span>
              <span className="text-sm text-gray-600">{metric.unit}</span>
            </div>
            <p className="text-sm text-gray-600 mt-1">{metric.title}</p>
          </div>
        </div>
      ))}
    </div>
  );
};
