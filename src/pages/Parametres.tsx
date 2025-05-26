
import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { ThresholdSettings } from '@/components/parametres/ThresholdSettings';
import { MachineManagement } from '@/components/parametres/MachineManagement';
import { MLParameters } from '@/components/parametres/MLParameters';
import { UserManagement } from '@/components/parametres/UserManagement';
import { Settings, Sliders, Cpu, Brain, Users } from 'lucide-react';

const Parametres = () => {
  const [activeTab, setActiveTab] = useState('thresholds');

  const tabs = [
    { id: 'thresholds', label: 'Seuils d\'Alerte', icon: Sliders },
    { id: 'machines', label: 'Machines', icon: Cpu },
    { id: 'ml', label: 'Paramètres ML', icon: Brain },
    { id: 'users', label: 'Utilisateurs', icon: Users },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'thresholds':
        return <ThresholdSettings />;
      case 'machines':
        return <MachineManagement />;
      case 'ml':
        return <MLParameters />;
      case 'users':
        return <UserManagement />;
      default:
        return <ThresholdSettings />;
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Paramètres</h1>
          <p className="text-gray-600">Configuration système et gestion des machines</p>
        </div>

        <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-lg border border-gray-200/50 overflow-hidden">
          {/* Onglets */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Contenu des onglets */}
          <div className="p-6">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Parametres;
