import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { AnomaliesDetected } from '@/components/prediction/AnomaliesDetected';
import { AnomalyDetails } from '@/components/prediction/AnomalyDetails';
import { MLModelControl } from '@/components/prediction/MLModelControl';
import { PredictionVisualization } from '@/components/prediction/PredictionVisualization';
import { useMLModel } from '@/contexts/MLModelContext';
import { Brain, AlertTriangle, TrendingUp, Settings, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface Anomaly {
  id: string;
  timestamp: Date;
  machine: string;
  riskScore: number;
  factors: string[];
  severity: 'low' | 'medium' | 'high' | 'critical';
  reconstructionError: number;
  rawData: {
    temperature: number;
    pressure: number;
    vibration: number;
  };
}

const Prediction = () => {
  const { predictions, metrics, isTraining, trainModel, isLoaded } = useMLModel();
  const [selectedAnomaly, setSelectedAnomaly] = useState<any>(null);
  const { toast } = useToast();

  // Convert ML predictions to component format
  const anomalies = predictions.map(pred => ({
    id: pred.id,
    timestamp: pred.timestamp,
    machine: pred.machine,
    riskScore: pred.riskScore,
    factors: pred.factors,
    severity: pred.severity,
    reconstructionError: pred.reconstructionError,
    rawData: {
      temperature: pred.rawData.temperature,
      pressure: pred.rawData.pressure,
      vibration: pred.rawData.vibration
    }
  }));

  const handleRetrainModel = async () => {
    try {
      // Generate synthetic training data based on industrial patterns
      const trainingData = Array.from({ length: 1000 }, () => [
        60 + Math.random() * 30,    // temperature (60-90°C)
        1.5 + Math.random() * 2,    // pressure (1.5-3.5 bar)
        0.2 + Math.random() * 1.2,  // vibration (0.2-1.4 mm/s)
        800 + Math.random() * 600,  // rotation (800-1400 rpm)
        8 + Math.random() * 10,     // current (8-18A)
        200 + Math.random() * 50    // voltage (200-250V)
      ]);

      await trainModel(trainingData);
      
      toast({
        title: "Modèle ré-entraîné",
        description: "Le modèle ML a été mis à jour avec succès",
      });
    } catch (error) {
      toast({
        title: "Erreur d'entraînement",
        description: "Impossible de ré-entraîner le modèle",
        variant: "destructive"
      });
    }
  };

  const handleSelectAnomaly = (anomaly: any) => {
    setSelectedAnomaly(anomaly);
  };

  if (!isLoaded) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement du modèle ML...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-4 sm:space-y-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Prédictions ML</h1>
            <p className="text-sm sm:text-base text-gray-600">Détection intelligente d'anomalies industrielles</p>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${isTraining ? 'bg-blue-500 animate-pulse' : 'bg-green-500'}`}></div>
            <span className="text-xs sm:text-sm text-gray-600">
              {isTraining ? 'Entraînement en cours...' : 'Modèle actif'}
            </span>
          </div>
        </div>

        {/* Model Performance Overview */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-white/80 backdrop-blur-md border border-gray-200/50">
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{metrics.accuracy.toFixed(1)}%</div>
                <div className="text-sm text-gray-600">Précision</div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 backdrop-blur-md border border-gray-200/50">
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{metrics.recall.toFixed(1)}%</div>
                <div className="text-sm text-gray-600">Rappel</div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 backdrop-blur-md border border-gray-200/50">
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{metrics.f1Score.toFixed(1)}%</div>
                <div className="text-sm text-gray-600">F1-Score</div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 backdrop-blur-md border border-gray-200/50">
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{anomalies.length}</div>
                <div className="text-sm text-gray-600">Anomalies</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ML Model Control */}
        <Card className="bg-white/80 backdrop-blur-md shadow-lg border border-gray-200/50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Brain className="w-5 h-5 text-purple-500" />
              <span>Contrôle du Modèle ML</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 flex-1">
                <div>
                  <div className="text-sm text-gray-600">Dernière formation</div>
                  <div className="font-medium">{metrics.lastTrained.toLocaleDateString()}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Perte (Loss)</div>
                  <div className="font-medium">{metrics.loss.toFixed(4)}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Entraînements</div>
                  <div className="font-medium">{metrics.trainingHistory.length}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Statut</div>
                  <div className="font-medium text-green-600">Opérationnel</div>
                </div>
              </div>
              <Button
                onClick={handleRetrainModel}
                disabled={isTraining}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
              >
                {isTraining ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Entraînement...</span>
                  </div>
                ) : (
                  <>
                    <Activity className="w-4 h-4 mr-2" />
                    Ré-entraîner
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
          {/* Anomalies List */}
          <div className="xl:col-span-2">
            <Card className="bg-white/80 backdrop-blur-md shadow-lg border border-gray-200/50">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                  <span>Anomalies Détectées</span>
                  <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-medium">
                    {anomalies.length}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <AnomaliesDetected 
                  anomalies={anomalies}
                  selectedAnomaly={selectedAnomaly}
                  onSelectAnomaly={handleSelectAnomaly}
                />
              </CardContent>
            </Card>
          </div>

          {/* Anomaly Details */}
          <div>
            <Card className="bg-white/80 backdrop-blur-md shadow-lg border border-gray-200/50">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5 text-blue-500" />
                  <span>Détail Anomalie</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <AnomalyDetails anomaly={selectedAnomaly} />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Prediction Visualization */}
        <Card className="bg-white/80 backdrop-blur-md shadow-lg border border-gray-200/50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="w-5 h-5 text-gray-500" />
              <span>Analyse et Visualisations</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <PredictionVisualization anomalies={anomalies} />
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Prediction;
