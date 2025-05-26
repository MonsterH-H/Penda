import { useState, useEffect } from 'react';
import { MLModelControlV2 } from '@/components/prediction/MLModelControlV2';
import { PredictionVisualizationV2 } from '@/components/prediction/PredictionVisualizationV2';
import { DataService } from '@/services/DataService';
import { AnomalyPrediction, MLModelStatus } from '@/types/prediction';
import { useToast } from '@/hooks/use-toast';

export const Dashboard = () => {
  const { toast } = useToast();
  const [anomalies, setAnomalies] = useState<AnomalyPrediction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // État du modèle ML
  const [modelStatus, setModelStatus] = useState<MLModelStatus>({
    isTraining: false,
    accuracy: 92.5,
    precision: 89.3,
    recall: 87.8,
    f1Score: 88.5,
    lastTrained: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 jours avant
  });

  // Charger les données au démarrage
  useEffect(() => {
    loadData();
  }, []);

  // Charger les données d'anomalies
  const loadData = () => {
    setIsLoading(true);
    
    try {
      // Récupérer les prédictions stockées
      const storedPredictions = DataService.getStoredPredictions();
      
      if (storedPredictions.length > 0) {
        setAnomalies(storedPredictions);
      } else {
        // Générer des données de démonstration si aucune donnée n'est disponible
        generateDemoData();
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      toast({
        title: "Erreur de chargement",
        description: "Impossible de charger les données d'anomalies.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Générer des données de démonstration
  const generateDemoData = () => {
    const demoAnomalies: AnomalyPrediction[] = [];
    const machines = ['Machine A', 'Machine B', 'Machine C', 'Machine D'];
    const severities: Array<'low' | 'medium' | 'high' | 'critical'> = ['low', 'medium', 'high', 'critical'];
    
    // Générer 50 anomalies aléatoires
    for (let i = 0; i < 50; i++) {
      const date = new Date();
      date.setDate(date.getDate() - Math.floor(Math.random() * 30)); // Sur les 30 derniers jours
      date.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60));
      
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
      
      demoAnomalies.push({
        id: `anomaly-${i}`,
        timestamp: date,
        machine: machines[Math.floor(Math.random() * machines.length)],
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
    
    // Trier par date décroissante
    demoAnomalies.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    
    // Enregistrer dans le stockage local et mettre à jour l'état
    demoAnomalies.forEach(anomaly => DataService.savePrediction(anomaly));
    setAnomalies(demoAnomalies);
  };

  // Fonction pour entraîner le modèle
  const handleTrainModel = () => {
    // Simuler l'entraînement du modèle
    setModelStatus(prev => ({
      ...prev,
      isTraining: true,
      trainingProgress: 0,
      trainingEpoch: 1,
      totalEpochs: 10,
      estimatedTimeRemaining: '5 minutes'
    }));
    
    toast({
      title: "Entraînement démarré",
      description: "Le modèle est en cours d'entraînement. Cela peut prendre quelques minutes."
    });
    
    // Simuler la progression de l'entraînement
    let progress = 0;
    let epoch = 1;
    const interval = setInterval(() => {
      progress += 10;
      if (progress > 100) {
        clearInterval(interval);
        
        // Mettre à jour les métriques après l'entraînement
        setModelStatus({
          isTraining: false,
          accuracy: 94.2,
          precision: 91.5,
          recall: 89.7,
          f1Score: 90.6,
          lastTrained: new Date()
        });
        
        toast({
          title: "Entraînement terminé",
          description: "Le modèle a été entraîné avec succès. Les performances ont été améliorées."
        });
        
        return;
      }
      
      if (progress % 20 === 0 && epoch < 10) {
        epoch += 1;
      }
      
      setModelStatus(prev => ({
        ...prev,
        trainingProgress: progress,
        trainingEpoch: epoch,
        estimatedTimeRemaining: `${Math.ceil((100 - progress) / 10) * 30} secondes`
      }));
    }, 3000);
  };

  // Fonction pour gérer l'upload de données
  const handleDataUpload = (file: File) => {
    toast({
      title: "Fichier reçu",
      description: `Le fichier ${file.name} a été reçu et sera utilisé pour l'entraînement du modèle.`
    });
  };

  return (
    <>
      
      <div className="container mx-auto px-4 py-6 space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>
        </div>
        
        {/* Contrôle du modèle */}
        <MLModelControlV2 
          modelStatus={modelStatus}
          onRetrain={handleTrainModel}
          onUploadData={handleDataUpload}
        />
        
        {/* Visualisation des prédictions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200/50 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Analyse des Anomalies</h2>
          
          {isLoading ? (
            <div className="h-64 flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-700"></div>
            </div>
          ) : anomalies.length === 0 ? (
            <div className="h-64 flex items-center justify-center">
              <div className="text-center">
                <p className="text-gray-500">Aucune anomalie détectée</p>
                <button 
                  onClick={generateDemoData}
                  className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                >
                  Générer des données de démonstration
                </button>
              </div>
            </div>
          ) : (
            <PredictionVisualizationV2 
              anomalies={anomalies}
              onRefresh={loadData}
            />
          )}
        </div>
      </div>
    </>
  );
};

export default Dashboard;
