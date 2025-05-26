import React, { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useMLModel } from '@/contexts/MLModelContext';
import { Button } from '@/components/ui/button';
import { DataService } from '@/services/DataService';
import { AnomalyPrediction } from '@/types/prediction';
import { useToast } from '@/hooks/use-toast';
import { PredictionVisualizationV2 } from '@/components/prediction/PredictionVisualizationV2';
import { Database, FileDown, RefreshCw, Check } from 'lucide-react';

// Composants modulaires
import { FileUploader } from '@/components/data/FileUploader';
import { DataFilters } from '@/components/data/DataFilters';
import { DataExporter } from '@/components/data/DataExporter';

const DataManagement = () => {
  const { toast } = useToast();
  const { predictions: modelPredictions, metrics, trainModel } = useMLModel();
  const [activeTab, setActiveTab] = useState('upload');
  const [isLoading, setIsLoading] = useState(false);
  const [predictions, setPredictions] = useState<AnomalyPrediction[]>([]);
  const [filteredPredictions, setFilteredPredictions] = useState<AnomalyPrediction[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMachine, setSelectedMachine] = useState<string>('all');
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined
  });
  const [uploadedFiles, setUploadedFiles] = useState<{name: string, size: number, date: Date, type: string}[]>([]);
  
  // Charger les prédictions au démarrage
  useEffect(() => {
    loadPredictions();
  }, []);
  
  // Filtrer les prédictions quand les filtres changent
  useEffect(() => {
    filterPredictions();
  }, [predictions, searchTerm, selectedMachine, dateRange]);
  
  // Charger les prédictions depuis le service
  const loadPredictions = () => {
    setIsLoading(true);
    try {
      // Récupérer les prédictions stockées
      const storedPredictions = DataService.getStoredPredictions();
      setPredictions(storedPredictions);
      
      // Simuler des fichiers téléchargés
      if (uploadedFiles.length === 0) {
        setUploadedFiles([
          { name: 'donnees_machine_A.csv', size: 45678, date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), type: 'csv' },
          { name: 'capteurs_usine_B.json', size: 128456, date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), type: 'json' }
        ]);
      }
      
      toast({
        title: "Données chargées",
        description: `${storedPredictions.length} prédictions récupérées`
      });
    } catch (error) {
      console.error('Erreur lors du chargement des prédictions:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les prédictions",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
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
    if (dateRange.from) {
      filtered = filtered.filter(p => p.timestamp >= dateRange.from!);
    }
    
    if (dateRange.to) {
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
    if (filteredPredictions.length === 0) return;
    
    // Utiliser le service pour exporter les données
    DataService.exportPredictionsToCSV(filteredPredictions);
    
    toast({
      title: "Export réussi",
      description: `${filteredPredictions.length} prédictions exportées au format CSV`
    });
  };
  
  // Gérer le téléversement d'un nouveau fichier
  const handleFileUpload = (file: File) => {
    // Ajouter le fichier à la liste des fichiers téléversés
    setUploadedFiles(prev => [
      {
        name: file.name,
        size: file.size,
        date: new Date(),
        type: file.name.split('.').pop() || ''
      },
      ...prev
    ]);
    
    toast({
      title: "Fichier téléversé",
      description: `${file.name} a été téléversé avec succès`
    });
    
    // Simuler un traitement des données
    setTimeout(() => {
      // Générer quelques prédictions aléatoires basées sur le fichier
      const newPredictions = generateSamplePredictions(5, file.name.includes('machine_A') ? 'Machine A' : 'Machine B');
      
      // Ajouter les nouvelles prédictions
      newPredictions.forEach(p => DataService.savePrediction(p));
      
      // Recharger les prédictions
      loadPredictions();
      
      toast({
        title: "Traitement terminé",
        description: `${newPredictions.length} nouvelles prédictions générées`
      });
    }, 2000);
  };
  
  // Supprimer un fichier téléversé
  const handleDeleteFile = (fileName: string) => {
    setUploadedFiles(prev => prev.filter(f => f.name !== fileName));
    
    toast({
      title: "Fichier supprimé",
      description: `${fileName} a été supprimé`
    });
  };
  
  // Entraîner le modèle avec les données actuelles
  const handleTrainModel = () => {
    toast({
      title: "Entraînement démarré",
      description: "Le modèle est en cours d'entraînement avec les données téléversées"
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

  // Réinitialiser tous les filtres
  const resetFilters = () => {
    setSearchTerm('');
    setSelectedMachine('all');
    setDateRange({ from: undefined, to: undefined });
  };
  
  // Exporter les métriques du modèle
  const handleExportMetrics = () => {
    const modelData = {
      metrics,
      lastUpdated: new Date().toISOString(),
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
            <p className="text-gray-600">Importez, visualisez et gérez vos données industrielles</p>
          </div>
          <Button 
            onClick={loadPredictions}
            variant="outline"
            className="mt-2 sm:mt-0"
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
        </div>

        <Tabs defaultValue="upload" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 w-full max-w-md mb-6">
            <TabsTrigger value="upload" className="flex items-center space-x-2">
              <Database className="w-4 h-4" />
              <span>Import</span>
            </TabsTrigger>
            {/* Historique SUPPRIMÉ */}
            <TabsTrigger value="export" className="flex items-center space-x-2">
              <FileDown className="w-4 h-4" />
              <span>Export</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="upload" className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-md shadow-lg border border-gray-200/50">
              <CardHeader>
                <CardTitle>Téléverser des données</CardTitle>
                <CardDescription>
                  Importez vos données industrielles pour entraîner le modèle ou générer des prédictions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FileUploader
                  onFileUpload={handleFileUpload}
                  uploadedFiles={uploadedFiles}
                  onDeleteFile={handleDeleteFile}
                />
                
                {uploadedFiles.length > 0 && (
                  <Button 
                    onClick={handleTrainModel}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Entraîner le modèle avec ces données
                  </Button>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Historique SUPPRIMÉ */}
          
          <TabsContent value="export" className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-md shadow-lg border border-gray-200/50">
              <CardHeader>
                <CardTitle>Exporter les données</CardTitle>
                <CardDescription>
                  Exportez les prédictions et métriques du modèle
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <DataExporter
                  onExportData={handleExportData}
                  predictionsCount={filteredPredictions.length}
                  metrics={metrics}
                  onExportMetrics={handleExportMetrics}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default DataManagement;