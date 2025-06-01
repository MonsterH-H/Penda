import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bell, Clock, Info, AlertTriangle, AlertOctagon, Trash2, CheckCircle, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  category: 'alert' | 'system' | 'maintenance';
  severity: 'low' | 'medium' | 'high' | 'critical';
  source: string;
}

const generateMockNotifications = (): Notification[] => {
  return [
    {
      id: 'notif-1',
      title: 'Température élevée détectée',
      message: 'La machine #3 présente une température anormalement élevée. Une intervention peut être nécessaire.',
      timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
      read: false,
      category: 'alert',
      severity: 'high',
      source: 'Machine 3'
    },
    {
      id: 'notif-2',
      title: 'Maintenance préventive planifiée',
      message: 'Une maintenance préventive est planifiée pour demain à 10h00 pour la Machine #1.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      read: true,
      category: 'maintenance',
      severity: 'medium',
      source: 'Système'
    },
    {
      id: 'notif-3',
      title: 'Mise à jour du système',
      message: 'Une mise à jour du système a été installée avec succès.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
      read: true,
      category: 'system',
      severity: 'low',
      source: 'Système'
    },
    {
      id: 'notif-4',
      title: 'Anomalie détectée',
      message: 'Le modèle ML a détecté une anomalie potentielle dans les données de vibration de la Machine #2.',
      timestamp: new Date(Date.now() - 1000 * 60 * 45), // 45 minutes ago
      read: false,
      category: 'alert',
      severity: 'medium',
      source: 'Machine 2'
    },
    {
      id: 'notif-5',
      title: 'Arrêt d\'urgence activé',
      message: 'La Machine #5 a activé son arrêt d\'urgence suite à une surcharge critique.',
      timestamp: new Date(Date.now() - 1000 * 60 * 20), // 20 minutes ago
      read: false,
      category: 'alert',
      severity: 'critical',
      source: 'Machine 5'
    },
  ];
};

const NotificationItem = ({ notification, onMarkAsRead, onDelete }: { 
  notification: Notification, 
  onMarkAsRead: (id: string) => void,
  onDelete: (id: string) => void
}) => {
  const getSeverityIcon = (severity: Notification['severity']) => {
    switch (severity) {
      case 'low':
        return <Info className="w-4 h-4 text-blue-500" />;
      case 'medium':
        return <Clock className="w-4 h-4 text-amber-500" />;
      case 'high':
        return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      case 'critical':
        return <AlertOctagon className="w-4 h-4 text-red-500" />;
    }
  };

  const getSeverityClass = (severity: Notification['severity']) => {
    switch (severity) {
      case 'low':
        return 'bg-blue-50 border-blue-200';
      case 'medium':
        return 'bg-amber-50 border-amber-200';
      case 'high':
        return 'bg-orange-50 border-orange-200';
      case 'critical':
        return 'bg-red-50 border-red-200';
    }
  };

  const getCategoryClass = (category: Notification['category']) => {
    switch (category) {
      case 'alert':
        return 'bg-red-100 text-red-800';
      case 'system':
        return 'bg-blue-100 text-blue-800';
      case 'maintenance':
        return 'bg-amber-100 text-amber-800';
    }
  };

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffMinutes < 60) {
      return `${diffMinutes} min`;
    } else if (diffMinutes < 24 * 60) {
      return `${Math.floor(diffMinutes / 60)} h`;
    } else {
      return `${Math.floor(diffMinutes / (60 * 24))} j`;
    }
  };

  return (
    <div 
      className={cn(
        'p-4 rounded-lg border transition-all duration-200 relative flex flex-col hover:shadow-md',
        notification.read ? 'bg-white border-gray-200' : getSeverityClass(notification.severity)
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          <div className="mt-0.5">
            {getSeverityIcon(notification.severity)}
          </div>
          <div>
            <h3 className="font-medium text-gray-900">{notification.title}</h3>
            <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
          </div>
        </div>
        <div className="flex flex-shrink-0 flex-col items-end space-y-2">
          <span className="text-xs text-gray-500">{formatTimestamp(notification.timestamp)}</span>
          <Badge variant="outline" className={cn('text-xs', getCategoryClass(notification.category))}>
            {notification.category === 'alert' ? 'Alerte' : 
             notification.category === 'system' ? 'Système' : 'Maintenance'}
          </Badge>
        </div>
      </div>

      <div className="flex items-center justify-between mt-4 pt-2 border-t border-gray-100">
        <span className="text-xs text-gray-500">{notification.source}</span>
        <div className="flex space-x-2">
          {!notification.read && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-xs h-8 px-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50"
              onClick={() => onMarkAsRead(notification.id)}
            >
              <CheckCircle className="w-3.5 h-3.5 mr-1" />
              Marquer comme lu
            </Button>
          )}
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-xs h-8 px-2 text-red-600 hover:text-red-800 hover:bg-red-50"
            onClick={() => onDelete(notification.id)}
          >
            <Trash2 className="w-3.5 h-3.5 mr-1" />
            Supprimer
          </Button>
        </div>
      </div>
    </div>
  );
};

const Notifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>(generateMockNotifications());
  const [filter, setFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [currentTab, setCurrentTab] = useState<string>('all');

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    );
  };

  const handleDelete = (id: string) => {
    setNotifications(prev => 
      prev.filter(notif => notif.id !== id)
    );
  };

  const handleClearAll = () => {
    setNotifications([]);
  };

  const filteredNotifications = notifications.filter(notification => {
    // Filtrer par l'onglet actif
    if (currentTab === 'unread' && notification.read) return false;
    if (currentTab === 'read' && !notification.read) return false;
    
    // Filtrer par catégorie
    if (filter !== 'all' && notification.category !== filter) return false;
    
    // Filtrer par sévérité
    if (severityFilter !== 'all' && notification.severity !== severityFilter) return false;
    
    return true;
  });

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
            <p className="text-gray-600 mt-1">Gérez vos alertes et notifications système</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            {unreadCount > 0 && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleMarkAllAsRead}
                className="border-blue-200 text-blue-700 hover:bg-blue-50"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Tout marquer comme lu
              </Button>
            )}
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleClearAll}
              className="border-red-200 text-red-700 hover:bg-red-50"
              disabled={notifications.length === 0}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Effacer tout
            </Button>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-lg border border-gray-200/50 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <Tabs 
              defaultValue="all" 
              className="w-full sm:w-auto"
              onValueChange={setCurrentTab}
            >
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="all">
                  Toutes
                  <Badge variant="secondary" className="ml-2">{notifications.length}</Badge>
                </TabsTrigger>
                <TabsTrigger value="unread">
                  Non lues
                  <Badge variant="secondary" className="ml-2">{unreadCount}</Badge>
                </TabsTrigger>
                <TabsTrigger value="read">
                  Lues
                  <Badge variant="secondary" className="ml-2">{notifications.length - unreadCount}</Badge>
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-500">Filtres:</span>
              </div>
              
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-[140px] h-9">
                  <SelectValue placeholder="Catégorie" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes</SelectItem>
                  <SelectItem value="alert">Alertes</SelectItem>
                  <SelectItem value="system">Système</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                </SelectContent>
              </Select>

              <Select value={severityFilter} onValueChange={setSeverityFilter}>
                <SelectTrigger className="w-[140px] h-9">
                  <SelectValue placeholder="Sévérité" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes</SelectItem>
                  <SelectItem value="low">Faible</SelectItem>
                  <SelectItem value="medium">Moyenne</SelectItem>
                  <SelectItem value="high">Haute</SelectItem>
                  <SelectItem value="critical">Critique</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            {filteredNotifications.length > 0 ? (
              filteredNotifications.map(notification => (
                <NotificationItem 
                  key={notification.id} 
                  notification={notification} 
                  onMarkAsRead={handleMarkAsRead}
                  onDelete={handleDelete}
                />
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                <Bell className="w-12 h-12 text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-1">Aucune notification</h3>
                <p className="text-gray-500">
                  {notifications.length === 0 
                    ? "Vous n'avez aucune notification pour le moment."
                    : "Aucune notification ne correspond aux filtres sélectionnés."
                  }
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Notifications;
