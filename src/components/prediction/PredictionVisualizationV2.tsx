import { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ScatterChart, Scatter, BarChart, Bar, Cell } from 'recharts';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Download, Filter, RefreshCw } from 'lucide-react';
import { AnomalyPrediction, MachineAnomalyStats } from '@/types/prediction';
import { DataService } from '@/services/DataService';

interface PredictionVisualizationProps {
  anomalies: AnomalyPrediction[];
  onRefresh?: () => void;
}

export const PredictionVisualizationV2 = ({ anomalies, onRefresh }: PredictionVisualizationProps) => {
  const [activeTab, setActiveTab] = useState('timeseries');
  const [selectedMachine, setSelectedMachine] = useState<string>('all');
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({from: undefined, to: undefined});
  
  // Filtrer les anomalies en fonction des critères sélectionnés
  const filteredAnomalies = useMemo(() => {
    return anomalies.filter(anomaly => {
      // Filtre par machine
      if (selectedMachine !== 'all' && anomaly.machine !== selectedMachine) {
        return false;
      }
      
      // Filtre par date
      if (dateRange.from && anomaly.timestamp < dateRange.from) {
        return false;
      }
      
      if (dateRange.to) {
        const endDate = new Date(dateRange.to);
        endDate.setHours(23, 59, 59, 999);
        if (anomaly.timestamp > endDate) {
          return false;
        }
      }
      
      return true;
    });
  }, [anomalies, selectedMachine, dateRange]);
  
  // Récupérer la liste des machines uniques
  const uniqueMachines = useMemo(() => {
    return Array.from(new Set(anomalies.map(a => a.machine)));
  }, [anomalies]);
  
  // Fonction pour exporter les données au format CSV
  const exportToCSV = () => {
    DataService.exportPredictionsToCSV(filteredAnomalies);
  };

  // Préparation des données pour les graphiques
  const timeSeriesData = useMemo(() => {
    return filteredAnomalies
      .slice(-20) // 20 dernières anomalies
      .map(anomaly => ({
        time: anomaly.timestamp.toLocaleTimeString(),
        date: anomaly.timestamp.toLocaleDateString(),
        riskScore: anomaly.riskScore,
        reconstructionError: anomaly.reconstructionError * 100, // Scale pour visualisation
        machine: anomaly.machine,
        severity: anomaly.severity
      }))
      .reverse();
  }, [filteredAnomalies]);

  // Données pour le scatter plot
  const scatterData = useMemo(() => {
    return filteredAnomalies.map(anomaly => {
      const severityColor = getSeverityColor(anomaly.severity);
      return {
        riskScore: anomaly.riskScore,
        reconstructionError: anomaly.reconstructionError * 100,
        severity: anomaly.severity,
        machine: anomaly.machine,
        fill: severityColor
      };
    });
  }, [filteredAnomalies]);

  // Statistiques par machine
  const machineStats = useMemo(() => {
    const stats: Record<string, { count: number, totalRisk: number }> = {};
    
    filteredAnomalies.forEach(anomaly => {
      if (!stats[anomaly.machine]) {
        stats[anomaly.machine] = { count: 0, totalRisk: 0 };
      }
      stats[anomaly.machine].count += 1;
      stats[anomaly.machine].totalRisk += anomaly.riskScore;
    });
    
    return stats;
  }, [filteredAnomalies]);

  // Données pour le graphique par machine
  const machineData = useMemo(() => {
    return Object.entries(machineStats).map(([machine, data]) => ({
      machine,
      count: data.count,
      averageRisk: data.count > 0 ? data.totalRisk / data.count : 0
    }));
  }, [machineStats]);

  // Fonction pour obtenir la couleur en fonction de la sévérité
  function getSeverityColor(severity: string): string {
    switch (severity) {
      case 'low': return '#3b82f6'; // blue-500
      case 'medium': return '#f59e0b'; // amber-500
      case 'high': return '#ef4444'; // red-500
      case 'critical': return '#7f1d1d'; // red-900
      default: return '#6b7280'; // gray-500
    }
  }

  return (
    <div className="space-y-6">
      {/* Filtres et actions */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          {/* Filtre par machine */}
          <Select value={selectedMachine} onValueChange={setSelectedMachine}>
            <SelectTrigger className="w-[180px] bg-white">
              <SelectValue placeholder="Toutes les machines" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les machines</SelectItem>
              {uniqueMachines.map(machine => (
                <SelectItem key={machine} value={machine}>{machine}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {/* Filtre par date */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="bg-white">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange.from ? (
                  dateRange.to ? (
                    <>Du {format(dateRange.from, 'dd/MM/yyyy')} au {format(dateRange.to, 'dd/MM/yyyy')}</>
                  ) : (
                    <>Depuis {format(dateRange.from, 'dd/MM/yyyy')}</>
                  )
                ) : (
                  "Sélectionner une période"
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="range"
                selected={{
                  from: dateRange.from,
                  to: dateRange.to,
                }}
                onSelect={(range) => setDateRange({
                  from: range?.from,
                  to: range?.to,
                })}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportToCSV} className="bg-white">
            <Download className="mr-2 h-4 w-4" />
            Exporter
          </Button>
          {onRefresh && (
            <Button variant="outline" onClick={onRefresh} className="bg-white">
              <RefreshCw className="mr-2 h-4 w-4" />
              Actualiser
            </Button>
          )}
        </div>
      </div>
      
      {/* Résumé des anomalies filtrées */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
        <div className="text-sm text-gray-500 mb-2">
          {filteredAnomalies.length} anomalies {selectedMachine !== 'all' ? `pour ${selectedMachine}` : ''}
          {dateRange.from && ` depuis le ${format(dateRange.from, 'dd/MM/yyyy')}`}
          {dateRange.to && ` jusqu'au ${format(dateRange.to, 'dd/MM/yyyy')}`}
        </div>
      </div>
      
      {/* Onglets de visualisation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-3 w-full max-w-md">
          <TabsTrigger value="timeseries">Série temporelle</TabsTrigger>
          <TabsTrigger value="scatter">Distribution</TabsTrigger>
          <TabsTrigger value="machines">Par machine</TabsTrigger>
        </TabsList>
        
        {/* Série temporelle */}
        <TabsContent value="timeseries" className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <h4 className="text-sm font-medium text-gray-700 mb-4">Évolution des scores de risque</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timeSeriesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="time" 
                  stroke="#6b7280" 
                  fontSize={12}
                  tick={{ fontSize: 10 }}
                />
                <YAxis 
                  stroke="#6b7280" 
                  fontSize={12}
                  domain={[0, 100]}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                    border: 'none', 
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                  formatter={(value: any, name: string) => [
                    name === 'riskScore' ? `${value.toFixed(1)}%` : value.toFixed(4),
                    name === 'riskScore' ? 'Score de Risque' : 'Erreur de Reconstruction'
                  ]}
                  labelFormatter={(time) => {
                    const entry = timeSeriesData.find(d => d.time === time);
                    return entry ? `${entry.date} ${entry.time} - ${entry.machine}` : time;
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="riskScore" 
                  stroke="#8b5cf6" 
                  strokeWidth={2}
                  dot={{ r: 4, strokeWidth: 1 }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                  name="Score de Risque"
                />
                <Line 
                  type="monotone" 
                  dataKey="reconstructionError" 
                  stroke="#ec4899" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ r: 4, strokeWidth: 1 }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                  name="Erreur de Reconstruction"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </TabsContent>
        
        {/* Distribution des anomalies */}
        <TabsContent value="scatter" className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <h4 className="text-sm font-medium text-gray-700 mb-4">Distribution des anomalies</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart data={scatterData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="riskScore" 
                  stroke="#6b7280" 
                  fontSize={12}
                  name="Score de Risque"
                  domain={[0, 100]}
                />
                <YAxis 
                  dataKey="reconstructionError" 
                  stroke="#6b7280" 
                  fontSize={12}
                  name="Erreur de Reconstruction"
                />
                <Tooltip 
                  cursor={{ strokeDasharray: '3 3' }}
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                    border: 'none', 
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                  formatter={(value: any, name: string) => [
                    name === 'reconstructionError' ? value.toFixed(4) : `${value.toFixed(1)}%`,
                    name === 'reconstructionError' ? 'Erreur de Reconstruction' : 'Score de Risque'
                  ]}
                  labelFormatter={(label, payload) => payload?.[0]?.payload?.machine || ''}
                />
                <Scatter name="Anomalies" dataKey="reconstructionError">
                  {scatterData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </TabsContent>
        
        {/* Distribution par machine */}
        <TabsContent value="machines" className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <h4 className="text-sm font-medium text-gray-700 mb-4">Anomalies par Machine</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={machineData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="machine" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                    border: 'none', 
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                  formatter={(value: any, name: string) => [
                    name === 'count' ? `${value} anomalies` : `${value.toFixed(1)}%`,
                    name === 'count' ? 'Nombre d\'anomalies' : 'Risque moyen'
                  ]}
                />
                <Bar 
                  dataKey="count" 
                  fill="#8b5cf6"
                  name="Nombre d'anomalies"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Statistiques récapitulatives */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 rounded-lg p-4 shadow-sm">
          <div className="text-2xl font-bold text-blue-900">{filteredAnomalies.length}</div>
          <div className="text-sm text-blue-600">Anomalies totales</div>
        </div>
        <div className="bg-red-50 rounded-lg p-4 shadow-sm">
          <div className="text-2xl font-bold text-red-900">
            {filteredAnomalies.filter(a => a.severity === 'critical').length}
          </div>
          <div className="text-sm text-red-600">Critiques</div>
        </div>
        <div className="bg-yellow-50 rounded-lg p-4 shadow-sm">
          <div className="text-2xl font-bold text-yellow-900">
            {filteredAnomalies.length > 0 ? (filteredAnomalies.reduce((sum, a) => sum + a.riskScore, 0) / filteredAnomalies.length).toFixed(1) : 0}%
          </div>
          <div className="text-sm text-yellow-600">Risque moyen</div>
        </div>
        <div className="bg-purple-50 rounded-lg p-4 shadow-sm">
          <div className="text-2xl font-bold text-purple-900">
            {Object.keys(machineStats).length}
          </div>
          <div className="text-sm text-purple-600">Machines affectées</div>
        </div>
      </div>
    </div>
  );
};
