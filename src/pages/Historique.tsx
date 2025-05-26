
import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { DateFilter } from '@/components/historique/DateFilter';
import { DataTable } from '@/components/historique/DataTable';
import { HistoricalCharts } from '@/components/historique/HistoricalCharts';
import { ExportButton } from '@/components/historique/ExportButton';
import { Calendar, Download, Filter, TrendingUp } from 'lucide-react';

const Historique = () => {
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 jours en arrière
    end: new Date()
  });
  const [selectedMachines, setSelectedMachines] = useState<string[]>(['all']);
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>(['temperature', 'pressure']);
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadHistoricalData();
  }, [dateRange, selectedMachines, selectedMetrics]);

  const loadHistoricalData = async () => {
    setIsLoading(true);
    // Simulation de chargement de données historiques
    setTimeout(() => {
      const mockData = Array.from({ length: 100 }, (_, i) => ({
        id: i + 1,
        timestamp: new Date(dateRange.start.getTime() + (i * 60000)), // 1 minute intervals
        machine: `Machine ${Math.floor(Math.random() * 6) + 1}`,
        temperature: 65 + Math.random() * 15,
        pressure: 2.0 + Math.random() * 1.0,
        vibration: 0.5 + Math.random() * 0.8,
        riskScore: Math.random() * 100,
        status: Math.random() > 0.8 ? 'warning' : Math.random() > 0.95 ? 'critical' : 'normal'
      }));
      setData(mockData);
      setIsLoading(false);
    }, 1000);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Historique des Données</h1>
            <p className="text-gray-600">Analyse des données passées et tendances</p>
          </div>
          <div className="flex items-center space-x-3">
            <ExportButton data={data} />
          </div>
        </div>

        {/* Filtres */}
        <div className="bg-white/80 backdrop-blur-md rounded-xl p-6 shadow-lg border border-gray-200/50">
          <div className="flex items-center space-x-2 mb-4">
            <Filter className="w-5 h-5 text-gray-500" />
            <h3 className="text-lg font-semibold text-gray-900">Filtres</h3>
          </div>
          <DateFilter
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
            selectedMachines={selectedMachines}
            onMachinesChange={setSelectedMachines}
            selectedMetrics={selectedMetrics}
            onMetricsChange={setSelectedMetrics}
          />
        </div>

        {/* Graphiques historiques */}
        <div className="bg-white/80 backdrop-blur-md rounded-xl p-6 shadow-lg border border-gray-200/50">
          <div className="flex items-center space-x-2 mb-6">
            <TrendingUp className="w-5 h-5 text-blue-500" />
            <h3 className="text-lg font-semibold text-gray-900">Tendances Historiques</h3>
          </div>
          <HistoricalCharts 
            startDate={dateRange.start} 
            endDate={dateRange.end}
            machineId={selectedMachines.includes('all') ? undefined : selectedMachines[0]} 
            selectedMetrics={selectedMetrics}
            aggregation='none'
          />
        </div>

        {/* Tableau de données */}
        <div className="bg-white/80 backdrop-blur-md rounded-xl p-6 shadow-lg border border-gray-200/50">
          <div className="flex items-center space-x-2 mb-6">
            <Calendar className="w-5 h-5 text-gray-500" />
            <h3 className="text-lg font-semibold text-gray-900">Données Détaillées</h3>
            <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">
              {data.length} entrées
            </span>
          </div>
          <DataTable data={data} isLoading={isLoading} />
        </div>
      </div>
    </AppLayout>
  );
};

export default Historique;
