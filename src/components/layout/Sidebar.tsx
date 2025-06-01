import { NavLink, useNavigate } from 'react-router-dom';
import { 
  Home, 
  History, 
  Brain, 
  Settings, 
  Activity,
  Database,
  HelpCircle,
  LogOut,
  Bell,
  User,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';

interface SidebarProps {
  onClose?: () => void;
}

// Regroupement des éléments de navigation par catégorie pour un menu plus organisé
const navigationItems = [
  // Catégorie principale
  { 
    name: 'Dashboard', 
    href: '/', 
    icon: Home,
    description: 'Vue générale',
    category: 'main'
  },
  
  // Catégorie données et analyses
  { 
    name: 'Prédiction', 
    href: '/prediction', 
    icon: Brain,
    description: 'Détection d\'anomalies',
    category: 'data'
  },
  { 
    name: 'Historique', 
    href: '/historique', 
    icon: History,
    description: 'Données passées',
    category: 'data'
  },
  { 
    name: 'Données', 
    href: '/donnees', 
    icon: Database,
    description: 'Gestion',
    category: 'data'
  },
  
  // Catégorie utilisateur
  { 
    name: 'Notifications', 
    href: '/notifications', 
    icon: Bell,
    description: 'Alertes',
    category: 'user'
  },
  { 
    name: 'Profil', 
    href: '/profil', 
    icon: User,
    description: 'Compte',
    category: 'user'
  },
  { 
    name: 'Paramètres', 
    href: '/parametres', 
    icon: Settings,
    description: 'Config',
    category: 'user'
  },
];

// Définition des catégories pour le regroupement visuel
const categories = [
  { id: 'main', label: 'Principal' },
  { id: 'data', label: 'Données & Analyses' },
  { id: 'user', label: 'Utilisateur' }
];

export const Sidebar = ({ onClose }: SidebarProps) => {
  const navigate = useNavigate();
  
  // ... existing code ...
  return (
    <div className="w-60 h-full bg-white/95 backdrop-blur-sm shadow-md border-r border-gray-100 flex flex-col">
      {/* En-tête avec logo et bouton de fermeture sur mobile */}
      <div className="p-3 sm:p-4 flex items-center justify-between border-b border-gray-100">
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 flex items-center justify-center bg-blue-500 rounded-lg">
            <img src="/penda-logo.svg" alt="Logo Penda" className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-800">Penda</h1>
            <p className="text-xs text-gray-500">Surveillance</p>
          </div>
        </div>
        
        {onClose && (
          <Button variant="ghost" size="sm" onClick={onClose} className="lg:hidden">
            <X className="w-4 h-4 text-gray-500" />
          </Button>
        )}
      </div>

      {/* Navigation principale avec catégories */}
      <nav className="px-3 py-4 flex-1 overflow-y-auto">
        {categories.map((category) => (
          <div key={category.id} className="mb-4">
            {/* En-tête de catégorie */}
            <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider px-3 mb-2">
              {category.label}
            </h3>
            
            {/* Éléments de navigation de cette catégorie */}
            <div className="space-y-1">
              {navigationItems
                .filter(item => item.category === category.id)
                .map((item) => (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={({ isActive }) =>
                    cn(
                      'group flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 relative',
                      isActive
                        ? 'text-blue-600 bg-blue-50'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      {/* Indicateur de sélection simplifié */}
                      {isActive && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600 rounded-r-full" />
                      )}
                      
                      <div className="flex items-center">
                        <div className={cn(
                          'flex-shrink-0 mr-2.5 w-8 h-8 flex items-center justify-center rounded-lg transition-all duration-200',
                          isActive 
                            ? 'text-blue-600' 
                            : 'text-gray-500 group-hover:text-blue-600'
                        )}>
                          <item.icon className="w-4.5 h-4.5" />
                        </div>
                        <div className="flex flex-col">
                          <span>{item.name}</span>
                          <span className="text-xs text-gray-500">{item.description}</span>
                        </div>
                      </div>
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
        
        {/* Section aide et déconnexion simplifiée */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="space-y-1">
            <NavLink
              to="/aide"
              className={({ isActive }) =>
                cn(
                  'group flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 relative',
                  isActive
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                )
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600 rounded-r-full" />
                  )}
                  <div className={cn(
                    'flex-shrink-0 mr-2.5 w-8 h-8 flex items-center justify-center rounded-lg',
                    isActive 
                      ? 'text-blue-600' 
                      : 'text-gray-500 group-hover:text-blue-600'
                  )}>
                    <HelpCircle className="w-4.5 h-4.5" />
                  </div>
                  <span>Aide</span>
                </>
              )}
            </NavLink>
            
            <button 
              onClick={() => {
                // Logique de déconnexion
                localStorage.removeItem('auth_token');
                sessionStorage.clear();
                // Redirection vers la page d'authentification
                navigate('/auth');
              }}
              className="w-full group flex items-center rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-red-600 transition-colors duration-200"
            >
              <div className="flex-shrink-0 mr-2.5 w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 group-hover:text-red-600">
                <LogOut className="w-4.5 h-4.5" />
              </div>
              <span>Déconnexion</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Le mini-widget d'alertes a été supprimé */}
    </div>
  );
};