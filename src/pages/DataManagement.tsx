import React, { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Check, Database, FileDown, LineChart, RefreshCw } from 'lucide-react';
import { DateRange } from 'react-day-picker';
import { AnomalyPrediction, MLModelStatus } from '@/types/prediction';

// Nouveaux imports pour les composants de gestion des données réelles
import { DataImportForm } from '@/components/data/DataImportForm';
import { DataVisualization } from '@/components/data/DataVisualization';
import { useMLModelStatus } from '@/hooks/data/useMLModel';
import { useMachineStatus } from '@/hooks/data/useMachineStatus';
import { TimestampedSensorData } from '@/api/sensorDataService';

// Type pour les résultats d'importation
interface ImportResult {
  success: boolean;
  message: string;
  data?: TimestampedSensorData[];
}

export default function DataManagement() {
  const { toast } = useToast();
  
  // États pour les onglets et le chargement
  const [activeTab, setActiveTab] = useState('import');
  const [isLoading, setIsLoading] = useState(false);
  
  // États pour les prédictions et filtres
  const [predictions, setPredictions] = useState<AnomalyPrediction[]>([]);
  const [filteredPredictions, setFilteredPredictions] = useState<AnomalyPrediction[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMachine, setSelectedMachine] = useState<string>('all');
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  
  // États pour les données importées
  const [importedData, setImportedData] = useState<TimestampedSensorData[]>([]);
  
  // Utiliser les hooks personnalisés pour accéder aux données réelles
  const { modelStatus, trainModel, isTraining, error: modelError } = useMLModelStatus();
  const { machines, isLoading: machinesLoading, error: machinesError } = useMachineStatus();
  
  // Filtrer les prédictions quand les filtres changent
  useEffect(() => {
    filterPredictions();
  }, [predictions, searchTerm, selectedMachine, dateRange]);
  
    // Gérer l'importation de données réussie
  const handleImportComplete = (result: ImportResult) => {    
    if (result.success && result.data) {
      setImportedData(result.data);
      
      toast({
        title: "Importation réussie",
        description: result.message,
      });
    } else {
      toast({
        title: "Erreur d'importation",
        description: result.message,
        variant: "destructive"
      });
    }
  };
  
    // Gérer l'entraînement du modèle réussi
  const handleTrainComplete = (result: ImportResult) => {
    if (result.success) {
      toast({
        title: "Entraînement réussi",
        description: result.message,
      });
    } else {
      toast({
        title: "Erreur d'entraînement",
        description: result.message,
        variant: "destructive"
      });
    }
  };
  
  // Filtrer les prédictions selon les critères
  const filterPredictions = () => {
    let filtered = [...predictions];
    
    // Filtre par machine
    if (selectedMachine !== 'all') {
      filtered = filtered.filter(p => p.machine === selectedMachine);
    }
    
    // Filtre par date
    if (dateRange?.from) {
      filtered = filtered.filter(p => p.timestamp >= dateRange.from!);
    }
    
    if (dateRange?.to) {
      const endDate = new Date(dateRange.to);
      endDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter(p => p.timestamp <= endDate);
    }
    
    // Filtre par recherche
    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(p => 
        p.machine.toLowerCase().includes(term) ||
        p.severity.toLowerCase().includes(term) ||
        p.factors.some(f => f.toLowerCase().includes(term))
      );
    }
    
    setFilteredPredictions(filtered);
  };

  // Exporter les données au format CSV
  const handleExportData = () => {
    // Utiliser l'adaptateur de données pour exporter les prédictions
    const blob = new Blob([generateCSV(filteredPredictions)], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `penda_predictions_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Données exportées",
      description: `${filteredPredictions.length} prédictions exportées au format CSV`
    });
  };
  
  // Générer le contenu CSV pour l'export
  const generateCSV = (data: AnomalyPrediction[]): string => {
    // Entêtes CSV
    const headers = [
      'ID',
      'Date',
      'Machine',
      'Score de risque',
      'Erreur de reconstruction',
      'Sévérité',
      'Facteurs',
      'Température',
      'Pression',
      'Vibration',
      'Rotation',
      'Courant',
      'Tension'
    ];
    
    // Lignes de données
    const rows = data.map(p => [
      p.id,
      p.timestamp.toISOString(),
      p.machine,
      p.riskScore.toFixed(2),
      p.reconstructionError.toFixed(4),
      p.severity,
      p.factors.join('; '),
      p.rawData.temperature.toFixed(2),
      p.rawData.pressure.toFixed(2),
      p.rawData.vibration.toFixed(2),
      p.rawData.rotation.toFixed(2),
      p.rawData.current.toFixed(2),
      p.rawData.voltage.toFixed(2)
    ]);
    
    // Construire le CSV complet
    return [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
  };

  // Réinitialiser tous les filtres
  const resetFilters = () => {
    setSearchTerm('');
    setSelectedMachine('all');
    setDateRange(undefined);
    
    toast({
      title: "Filtres réinitialisés",
      description: "Tous les filtres ont été réinitialisés"
    });
  };
  
  // Générer des prédictions d'exemple
  const generateSamplePredictions = (count: number, machineName: string): AnomalyPrediction[] => {
    const predictions: AnomalyPrediction[] = [];
    const severities: Array<'low' | 'medium' | 'high' | 'critical'> = ['low', 'medium', 'high', 'critical'];
    
    for (let i = 0; i < count; i++) {
      const date = new Date();
      date.setHours(date.getHours() - Math.floor(Math.random() * 24));
      
      const riskScore = Math.floor(Math.random() * 100);
      let severity: 'low' | 'medium' | 'high' | 'critical';
      
      if (riskScore < 25) severity = 'low';
      else if (riskScore < 50) severity = 'medium';
      else if (riskScore < 75) severity = 'high';
      else severity = 'critical';
      
      const temperature = 65 + Math.random() * 20;
      const pressure = 2.0 + Math.random() * 1.5;
      const vibration = 0.5 + Math.random() * 1.0;
      const rotation = 1000 + Math.random() * 500;
      const current = 10 + Math.random() * 8;
      const voltage = 220 + Math.random() * 40;
      
      // Déterminer les facteurs contribuant à l'anomalie
      const factors = [];
      if (temperature > 75) factors.push('Température élevée');
      if (pressure > 3.0) factors.push('Pression élevée');
      if (vibration > 1.2) factors.push('Vibration excessive');
      if (rotation > 1400) factors.push('Rotation rapide');
      if (current > 15) factors.push('Courant élevé');
      if (voltage > 250) factors.push('Tension élevée');
      
      predictions.push({
        id: `anomaly-${Date.now()}-${i}`,
        timestamp: date,
        machine: machineName,
        riskScore,
        reconstructionError: Math.random() * 0.1,
        severity,
        factors: factors.length > 0 ? factors : ['Cause inconnue'],
        rawData: {
          temperature,
          pressure,
          vibration,
          rotation,
          current,
          voltage
        }
      });
    }
    
    return predictions;
  };

    // Exporter les métriques du modèle
  const handleExportMetrics = () => {
    if (!modelStatus) {
      toast({
        title: "Erreur",
        description: "Aucune métrique de modèle disponible",
        variant: "destructive"
      });
      return;
    }
    
    const modelData = {
      metrics: {
        accuracy: modelStatus.accuracy,
        precision: modelStatus.precision,
        recall: modelStatus.recall,
        f1Score: modelStatus.f1Score,
        lastTrained: modelStatus.lastTrained.toISOString()
      },
      predictions: {
        total: predictions.length,
        critical: predictions.filter(p => p.severity === 'critical').length,
        high: predictions.filter(p => p.severity === 'high').length,
        medium: predictions.filter(p => p.severity === 'medium').length,
        low: predictions.filter(p => p.severity === 'low').length,
      },
      modelName: 'Penda Autoencoder v1.0'
    };
    
    const blob = new Blob([JSON.stringify(modelData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `penda_model_metrics_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Métriques exportées",
      description: "Les métriques du modèle ont été exportées au format JSON"
    });
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestion des données</h1>
            <p className="text-gray-600">Importez, visualisez et gérez vos données industrielles réelles</p>
          </div>
          <Button 
            onClick={resetFilters}
            variant="outline"
            className="mt-2 sm:mt-0"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Réinitialiser les filtres
          </Button>
        </div>

        <Tabs defaultValue="import" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 w-full max-w-md mb-6">
            <TabsTrigger value="import" className="flex items-center space-x-2">
              <Database className="w-4 h-4" />
              <span>Import</span>
            </TabsTrigger>
            <TabsTrigger value="visualize" className="flex items-center space-x-2">
              <LineChart className="w-4 h-4" />
              <span>Visualisation</span>
            </TabsTrigger>
            <TabsTrigger value="export" className="flex items-center space-x-2">
              <FileDown className="w-4 h-4" />
              <span>Export</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="import" className="space-y-6">
            {/* Nouveau composant d'importation de données réelles */}
            <DataImportForm 
              onImportComplete={handleImportComplete}
              onTrainComplete={handleTrainComplete}
            />
          </TabsContent>
          
          <TabsContent value="visualize" className="space-y-6">
            {/* Nouveau composant de visualisation des données réelles */}
            <DataVisualization data={importedData} />
          </TabsContent>
          
          <TabsContent value="export" className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-md shadow-lg border border-gray-200/50">
              <CardHeader>
                <CardTitle>Exporter les données</CardTitle>
                <CardDescription>
                  Exportez les prédictions et métriques du modèle
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Prédictions</h3>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">
                          {filteredPredictions.length} prédictions disponibles
                        </p>
                      </div>
                      <Button
                        onClick={handleExportData}
                        disabled={filteredPredictions.length === 0}
                        size="sm"
                      >
                        <FileDown className="w-4 h-4 mr-2" />
                        Exporter en CSV
                      </Button>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Métriques du modèle</h3>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">
                          {modelStatus ? `Dernier entraînement: ${modelStatus.lastTrained.toLocaleDateString()}` : 'Aucune métrique disponible'}
                        </p>
                      </div>
                      <Button
                        onClick={handleExportMetrics}
                        disabled={!modelStatus}
                        size="sm"
                      >
                        <FileDown className="w-4 h-4 mr-2" />
                        Exporter en JSON
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

// Le composant est déjà exporté en tant que default au début du fichier