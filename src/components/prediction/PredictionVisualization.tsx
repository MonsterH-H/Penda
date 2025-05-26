import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ScatterChart, Scatter, BarChart, Bar, Cell } from 'recharts';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Download, Filter, RefreshCw } from 'lucide-react';

interface Anomaly {
  id: string;
  timestamp: Date;
  machine: string;
  riskScore: number;
  reconstructionError: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  factors: string[];
  rawData: {
    temperature: number;
    pressure: number;
    vibration: number;
    rotation: number;
    current: number;
    voltage: number;
  };
}

interface PredictionVisualizationProps {
  anomalies: Anomaly[];
  onRefresh?: () => void;
}

export const PredictionVisualization = ({ anomalies, onRefresh }: PredictionVisualizationProps) => {
  const [activeTab, setActiveTab] = useState('timeseries');
  const [selectedMachine, setSelectedMachine] = useState<string>('all');
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({from: undefined, to: undefined});
  
  // Filtrer les anomalies en fonction des critères sélectionnés
  const filteredAnomalies = anomalies.filter(anomaly => {
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
  
  // Récupérer la liste des machines uniques
  const uniqueMachines = Array.from(new Set(anomalies.map(a => a.machine)));
  
  // Fonction pour exporter les données au format CSV
  const exportToCSV = () => {
    const headers = [
      'ID', 'Date', 'Heure', 'Machine', 'Score de risque', 'Sévérité', 
      'Température', 'Pression', 'Vibration', 'Rotation', 'Courant', 'Tension', 'Facteurs'
    ];
    
    const rows = filteredAnomalies.map(a => [
      a.id,
      a.timestamp.toLocaleDateString(),
      a.timestamp.toLocaleTimeString(),
      a.machine,
      a.riskScore.toFixed(2),
      a.severity,
      a.rawData.temperature.toFixed(2),
      a.rawData.pressure.toFixed(2),
      a.rawData.vibration.toFixed(2),
      a.rawData.rotation.toFixed(2),
      a.rawData.current.toFixed(2),
      a.rawData.voltage.toFixed(2),
      a.factors.join('; ')
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `penda_anomalies_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Préparation des données pour les graphiques
  const timeSeriesData = anomalies
    .slice(-20) // 20 dernières anomalies
    .map(anomaly => ({
      time: anomaly.timestamp.toLocaleTimeString(),
      riskScore: anomaly.riskScore,
      reconstructionError: anomaly.reconstructionError * 100, // Scale pour visualisation
      machine: anomaly.machine
    }))
    .reverse();

  const scatterData = anomalies.map(anomaly => ({
    riskScore: anomaly.riskScore,
    reconstructionError: anomaly.reconstructionError * 100,
    severity: anomaly.severity,
    machine: anomaly.machine,
    fill: getSeverityColor(anomaly.severity)
  }));

  const machineStats = anomalies.reduce((acc, anomaly) => {
    acc[anomaly.machine] = (acc[anomaly.machine] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const machineData = Object.entries(machineStats).map(([machine, count]) => ({
    machine,
    count,
    avgRisk: anomalies
      .filter(a => a.machine === machine)
      .reduce((sum, a) => sum + a.riskScore, 0) / count
  }));

  function getSeverityColor(severity: string): string {
    switch (severity) {
      case 'low': return '#10b981';
      case 'medium': return '#f59e0b';
      case 'high': return '#f97316';
      case 'critical': return '#ef4444';
      default: return '#6b7280';
    }
  }

  return (
    <div className="space-y-6">
      {/* Filtres et controles */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4 bg-gray-50 p-4 rounded-lg">
        <div className="flex flex-wrap gap-2">
          {/* Filtre par machine */}
          <Select value={selectedMachine} onValueChange={setSelectedMachine}>
            <SelectTrigger className="w-[180px]">
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
              <Button variant="outline" className="flex gap-2 items-center">
                <CalendarIcon className="h-4 w-4" />
                {dateRange.from ? (
                  dateRange.to ? (
                    <>Du {format(dateRange.from, 'dd/MM/yyyy')} au {format(dateRange.to, 'dd/MM/yyyy')}</>
                  ) : (
                    format(dateRange.from, 'dd/MM/yyyy')
                  )
                ) : (
                  <span>Toutes les dates</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="range"
                selected={{
                  from: dateRange.from,
                  to: dateRange.to
                }}
                onSelect={(range) => setDateRange({
                  from: range?.from,
                  to: range?.to
                })}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportToCSV}>
            <Download className="mr-2 h-4 w-4" />
            Exporter
          </Button>
          {onRefresh && (
            <Button variant="outline" onClick={onRefresh}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Actualiser
            </Button>
          )}
        </div>
      </div>
      
      {/* Onglets de visualisation */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 w-full max-w-md">
          <TabsTrigger value="timeseries">Série temporelle</TabsTrigger>
          <TabsTrigger value="scatter">Distribution</TabsTrigger>
          <TabsTrigger value="machines">Par machine</TabsTrigger>
        </TabsList>
        
        {/* Série temporelle */}
        <TabsContent value="timeseries">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
            <h4 className="text-sm font-medium text-gray-700 mb-4">Évolution des scores de risque</h4>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={timeSeriesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="time" 
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
                  <Line 
                    type="monotone" 
                    dataKey="riskScore" 
                    stroke="#ef4444" 
                    strokeWidth={2}
                    dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
                    name="Score de Risque (%)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </TabsContent>
        
        {/* Distribution des anomalies */}
        <TabsContent value="scatter">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
            <h4 className="text-sm font-medium text-gray-700 mb-4">Corrélation Score de Risque / Erreur de Reconstruction</h4>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart data={scatterData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="riskScore" 
                    stroke="#6b7280" 
                    fontSize={12}
                    name="Score de Risque"
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
                  <Scatter dataKey="reconstructionError">
                    {scatterData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </div>
        </TabsContent>
        
        {/* Distribution par machine */}
        <TabsContent value="machines">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
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
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Statistiques récapitulatives */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-blue-900">{filteredAnomalies.length}</div>
          <div className="text-sm text-blue-600">Anomalies totales</div>
        </div>
        <div className="bg-red-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-red-900">
            {filteredAnomalies.filter(a => a.severity === 'critical').length}
          </div>
          <div className="text-sm text-red-600">Critiques</div>
        </div>
        <div className="bg-yellow-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-yellow-900">
            {filteredAnomalies.length > 0 ? (filteredAnomalies.reduce((sum, a) => sum + a.riskScore, 0) / filteredAnomalies.length).toFixed(1) : 0}%
          </div>
          <div className="text-sm text-yellow-600">Risque moyen</div>
        </div>
        <div className="bg-purple-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-purple-900">
            {Object.keys(machineStats).length}
          </div>
          <div className="text-sm text-purple-600">Machines affectées</div>
        </div>
      </div>
    </div>
  );
};
