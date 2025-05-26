
import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { MetricsOverview } from '@/components/dashboard/MetricsOverview';
import { RealTimeCharts } from '@/components/dashboard/RealTimeCharts';
import { MachineStatusGrid } from '@/components/dashboard/MachineStatusGrid';
import { AlertsPanel } from '@/components/dashboard/AlertsPanel';
import { MLModelStatus } from '@/components/dashboard/MLModelStatus';
import { useMLModel } from '@/contexts/MLModelContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, TrendingUp, Shield, Zap } from 'lucide-react';

const Index = () => {
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const { isLoaded, predict, metrics } = useMLModel();

  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdate(new Date());
      
      // Generate synthetic sensor data and predict anomalies
      if (isLoaded) {
        const sensorData = [
          65 + Math.random() * 20,  // temperature
          2.0 + Math.random() * 1.5, // pressure
          0.5 + Math.random() * 1.0, // vibration
          1000 + Math.random() * 500, // rotation
          10 + Math.random() * 8,   // current
          220 + Math.random() * 40  // voltage
        ];
        
        predict(sensorData).catch(console.error);
      }
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, [isLoaded, predict]);

  return (
    <AppLayout>
      <div className="space-y-4 sm:space-y-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard Industriel</h1>
            <p className="text-sm sm:text-base text-gray-600">Surveillance intelligente en temps réel</p>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-xs sm:text-sm text-gray-500">
                En temps réel
              </span>
            </div>
            <div className="text-xs sm:text-sm text-gray-500">
              Dernière mise à jour: {lastUpdate.toLocaleTimeString()}
            </div>
          </div>
        </div>

        {/* Key Performance Indicators */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Efficacité Globale</p>
                  <p className="text-2xl font-bold">94.2%</p>
                </div>
                <TrendingUp className="w-8 h-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">Temps de Fonctionnement</p>
                  <p className="text-2xl font-bold">99.1%</p>
                </div>
                <Activity className="w-8 h-8 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">Précision ML</p>
                  <p className="text-2xl font-bold">{metrics.accuracy.toFixed(1)}%</p>
                </div>
                <Shield className="w-8 h-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm">Économies d'Énergie</p>
                  <p className="text-2xl font-bold">12.3%</p>
                </div>
                <Zap className="w-8 h-8 text-orange-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Metrics Overview */}
        <MetricsOverview />

        {/* Main Dashboard Content */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
          {/* Charts Section */}
          <div className="xl:col-span-2 space-y-4 sm:space-y-6">
            <RealTimeCharts />
            <div className="block lg:hidden">
              <AlertsPanel />
            </div>
          </div>

          {/* Sidebar Content */}
          <div className="space-y-4 sm:space-y-6">
            <div className="hidden lg:block">
              <AlertsPanel />
            </div>
            <MLModelStatus />
          </div>
        </div>

        {/* Machine Status Grid */}
        <MachineStatusGrid />
      </div>
    </AppLayout>
  );
};

export default Index;
