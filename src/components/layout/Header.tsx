
import { Bell, User, Settings, Menu, X, Search, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { Link } from 'react-router-dom';

interface HeaderProps {
  onMenuClick: () => void;
}

export const Header = ({ onMenuClick }: HeaderProps) => {
  const [showSearch, setShowSearch] = useState(false);
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: 'Alerte Machine 3',
      message: 'Température élevée détectée',
      time: '11:25',
      read: false
    },
    {
      id: 2,
      title: 'Maintenance Planifiée',
      message: 'Mise à jour du système prévue',
      time: '09:15',
      read: true
    }
  ]);
  const [showNotifications, setShowNotifications] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;
  
  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  return (
    <header className="bg-white/90 backdrop-blur-md shadow-sm border-b border-gray-200/50 px-4 sm:px-6 py-3 sticky top-0 z-30">
      <div className="flex items-center justify-between">
        {/* Partie gauche: Menu hamburger (mobile) et état du système */}
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={onMenuClick}>
            <Menu className="w-5 h-5 text-gray-700" />
          </Button>
          
          <div className="hidden sm:flex items-center space-x-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            </div>
            <span className="text-sm text-gray-600 font-medium">Système opérationnel</span>
          </div>
        </div>

        {/* Logo centré pour mobile */}
        <div className="sm:hidden absolute left-1/2 transform -translate-x-1/2">
          <div className="flex items-center space-x-1">
            <Shield className="w-5 h-5 text-blue-600" />
            <span className="font-bold text-gray-900">Penda</span>
          </div>
        </div>

        {/* Partie droite: Actions */}
        <div className="flex items-center space-x-1 sm:space-x-3">
          {/* Barre de recherche */}
          {showSearch ? (
            <div className="fixed inset-0 z-50 bg-gray-900/50 backdrop-blur-sm sm:relative sm:inset-auto sm:bg-transparent sm:backdrop-blur-none" onClick={() => setShowSearch(false)}>
              <div className="w-full p-4 bg-white sm:absolute sm:right-0 sm:top-full sm:mt-2 sm:w-80 sm:rounded-lg sm:shadow-lg sm:border border-gray-200/70 sm:p-2"
                onClick={e => e.stopPropagation()}>
                <div className="relative flex items-center">
                  <Search className="absolute left-3 w-4 h-4 text-gray-500" />
                  <input 
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Rechercher..."
                    autoFocus
                  />
                  <Button variant="ghost" size="icon" className="absolute right-1" onClick={() => setShowSearch(false)}>
                    <X className="w-4 h-4 text-gray-500" />
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <Button variant="ghost" size="icon" onClick={() => setShowSearch(true)}>
              <Search className="w-5 h-5 text-gray-700" />
            </Button>
          )}

          {/* Notifications */}
          <div className="relative">
            <Button 
              variant="ghost" 
              size="icon" 
              className="relative"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <Bell className="w-5 h-5 text-gray-700" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">{unreadCount}</span>
              )}
            </Button>

            {/* Dropdown de notifications */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-lg shadow-lg border border-gray-200/70 z-50" onClick={e => e.stopPropagation()}>
                <div className="p-3 border-b border-gray-200 flex justify-between items-center">
                  <h3 className="font-medium text-gray-900">Notifications</h3>
                  <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                    <span className="text-xs text-blue-600">Tout marquer comme lu</span>
                  </Button>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.length > 0 ? notifications.map(notification => (
                    <div key={notification.id} className={`p-3 border-b border-gray-100 hover:bg-gray-50 ${!notification.read ? 'bg-blue-50/50' : ''}`}>
                      <div className="flex justify-between">
                        <span className="font-medium text-sm text-gray-900">{notification.title}</span>
                        <span className="text-xs text-gray-500">{notification.time}</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                    </div>
                  )) : (
                    <div className="p-6 text-center text-gray-500">
                      <p>Aucune notification</p>
                    </div>
                  )}
                </div>
                <div className="p-2 border-t border-gray-200 text-center">
                  <Link to="/notifications" className="text-xs text-blue-600 hover:text-blue-800">
                    Voir toutes les notifications
                  </Link>
                </div>
              </div>
            )}
          </div>
          
          {/* Réglages - caché sur petits écrans */}
          <Button variant="ghost" size="icon" className="hidden sm:flex">
            <Settings className="w-5 h-5 text-gray-700" />
          </Button>
          
          {/* Profil utilisateur */}
          <Button variant="ghost" size="icon" className="flex-shrink-0 rounded-full border-2 border-transparent hover:border-blue-500 transition-all duration-200">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white font-medium">
              EM
            </div>
          </Button>
        </div>
      </div>
    </header>
  );
};
