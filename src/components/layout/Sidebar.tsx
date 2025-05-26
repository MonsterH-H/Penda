
import { NavLink } from 'react-router-dom';
import { 
  Home, 
  History, 
  Brain, 
  Settings, 
  Activity,
  AlertTriangle,
  Database
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navigationItems = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Historique', href: '/historique', icon: History },
  { name: 'Prédiction ML', href: '/prediction', icon: Brain },
  { name: 'Données', href: '/donnees', icon: Database },
  { name: 'Paramètres', href: '/parametres', icon: Settings },
];

export const Sidebar = () => {
  return (
    <div className="w-64 bg-white/80 backdrop-blur-md shadow-lg border-r border-gray-200/50">
      <div className="p-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 flex items-center justify-center">
            <img src="/penda-logo.svg" alt="Logo Penda" className="w-10 h-10" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Penda</h1>
            <p className="text-sm text-gray-600">Surveillance Intelligente</p>
          </div>
        </div>
      </div>

      <nav className="px-4 space-y-2">
        {navigationItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) =>
              cn(
                'flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
              )
            }
          >
            <item.icon className="w-5 h-5" />
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>

      <div className="absolute bottom-6 left-4 right-4">
        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg p-4 text-white">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5" />
            <span className="text-sm font-medium">2 Alertes actives</span>
          </div>
        </div>
      </div>
    </div>
  );
};
