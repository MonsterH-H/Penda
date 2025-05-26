
import { useState } from 'react';
import { Plus, Edit, Trash2, Shield, User, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'operator' | 'viewer';
  status: 'active' | 'inactive';
  lastLogin: Date;
  permissions: string[];
}

export const UserManagement = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([
    {
      id: '1',
      name: 'Jean Dupont',
      email: 'jean.dupont@entreprise.com',
      role: 'admin',
      status: 'active',
      lastLogin: new Date(),
      permissions: ['all']
    },
    {
      id: '2',
      name: 'Marie Martin',
      email: 'marie.martin@entreprise.com',
      role: 'operator',
      status: 'active',
      lastLogin: new Date(Date.now() - 3600000),
      permissions: ['read', 'monitor', 'configure']
    },
    {
      id: '3',
      name: 'Pierre Durand',
      email: 'pierre.durand@entreprise.com',
      role: 'viewer',
      status: 'active',
      lastLogin: new Date(Date.now() - 86400000),
      permissions: ['read']
    }
  ]);

  const getRoleIcon = (role: User['role']) => {
    switch (role) {
      case 'admin':
        return <Crown className="w-4 h-4 text-yellow-500" />;
      case 'operator':
        return <Shield className="w-4 h-4 text-blue-500" />;
      case 'viewer':
        return <User className="w-4 h-4 text-gray-500" />;
    }
  };

  const getRoleBadge = (role: User['role']) => {
    const styles = {
      admin: 'bg-yellow-100 text-yellow-700',
      operator: 'bg-blue-100 text-blue-700',
      viewer: 'bg-gray-100 text-gray-700'
    };
    
    const labels = {
      admin: 'Administrateur',
      operator: 'Opérateur',
      viewer: 'Observateur'
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[role]}`}>
        {labels[role]}
      </span>
    );
  };

  const getStatusBadge = (status: User['status']) => {
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
        status === 'active' 
          ? 'bg-green-100 text-green-700' 
          : 'bg-red-100 text-red-700'
      }`}>
        {status === 'active' ? 'Actif' : 'Inactif'}
      </span>
    );
  };

  const handleStatusToggle = (userId: string) => {
    setUsers(prev => prev.map(user => 
      user.id === userId 
        ? { ...user, status: user.status === 'active' ? 'inactive' : 'active' as User['status'] }
        : user
    ));
    
    toast({
      title: "Statut mis à jour",
      description: "Le statut de l'utilisateur a été modifié",
    });
  };

  const handleDeleteUser = (userId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      setUsers(prev => prev.filter(user => user.id !== userId));
      toast({
        title: "Utilisateur supprimé",
        description: "L'utilisateur a été supprimé avec succès",
      });
    }
  };

  const rolePermissions = {
    admin: [
      'Accès complet au système',
      'Gestion des utilisateurs',
      'Configuration des paramètres',
      'Gestion des machines',
      'Configuration ML'
    ],
    operator: [
      'Surveillance des machines',
      'Consultation des données',
      'Configuration des seuils',
      'Export des données',
      'Gestion des alertes'
    ],
    viewer: [
      'Consultation des données',
      'Visualisation des graphiques',
      'Accès aux historiques',
      'Lecture seule'
    ]
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Gestion des Utilisateurs</h3>
          <p className="text-sm text-gray-600">Administrez les accès et permissions des utilisateurs</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Nouvel utilisateur
        </Button>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-blue-900">{users.length}</div>
          <div className="text-sm text-blue-600">Total utilisateurs</div>
        </div>
        <div className="bg-yellow-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-yellow-900">
            {users.filter(u => u.role === 'admin').length}
          </div>
          <div className="text-sm text-yellow-600">Administrateurs</div>
        </div>
        <div className="bg-green-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-green-900">
            {users.filter(u => u.status === 'active').length}
          </div>
          <div className="text-sm text-green-600">Actifs</div>
        </div>
        <div className="bg-purple-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-purple-900">
            {users.filter(u => u.lastLogin > new Date(Date.now() - 86400000)).length}
          </div>
          <div className="text-sm text-purple-600">Connectés aujourd'hui</div>
        </div>
      </div>

      {/* Liste des utilisateurs */}
      <div className="space-y-4">
        {users.map((user) => (
          <div key={user.id} className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium">
                    {user.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">{user.name}</h4>
                  <p className="text-sm text-gray-600">{user.email}</p>
                </div>
                <div className="flex items-center space-x-2">
                  {getRoleIcon(user.role)}
                  {getRoleBadge(user.role)}
                </div>
                {getStatusBadge(user.status)}
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleStatusToggle(user.id)}
                >
                  {user.status === 'active' ? 'Désactiver' : 'Activer'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeleteUser(user.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h5 className="text-sm font-medium text-gray-700 mb-2">Informations</h5>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Dernière connexion:</span>
                    <span className="text-gray-900">{user.lastLogin.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Statut:</span>
                    <span className="text-gray-900">{user.status === 'active' ? 'Actif' : 'Inactif'}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h5 className="text-sm font-medium text-gray-700 mb-2">Permissions</h5>
                <div className="space-y-1">
                  {rolePermissions[user.role].slice(0, 3).map((permission, index) => (
                    <div key={index} className="flex items-center space-x-2 text-xs">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                      <span className="text-gray-600">{permission}</span>
                    </div>
                  ))}
                  {rolePermissions[user.role].length > 3 && (
                    <div className="text-xs text-gray-500">
                      +{rolePermissions[user.role].length - 3} autres permissions
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
