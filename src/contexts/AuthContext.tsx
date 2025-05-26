import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/types/user';
import { AuthService } from '@/services/AuthService';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: Omit<User, 'password'> | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  register: (userData: Partial<User>) => Promise<void>;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<Omit<User, 'password'> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Vérifier s'il existe une session utilisateur
    const checkAuth = async () => {
      try {
        const storedUser = localStorage.getItem('penda_user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error('Vérification d\'authentification échouée:', error);
        localStorage.removeItem('penda_user');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const authenticatedUser = await AuthService.login(email, password);
      setUser(authenticatedUser);
      localStorage.setItem('penda_user', JSON.stringify(authenticatedUser));

      toast({
        title: 'Connexion réussie',
        description: `Bienvenue, ${authenticatedUser.name}`,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur de connexion';
      setError(errorMessage);

      toast({
        title: 'Erreur de connexion',
        description: errorMessage,
        variant: 'destructive'
      });

      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('penda_user');

    toast({
      title: 'Deconnexion',
      description: 'Vous avez ete deconnecte avec succes',
    });
  };

  const updateProfile = async (data: Partial<User>) => {
    if (!user) throw new Error('Aucun utilisateur connecte');
    setIsLoading(true);

    try {
      const updatedUser = await AuthService.updateProfile(user.id, data);
      setUser(updatedUser);
      localStorage.setItem('penda_user', JSON.stringify(updatedUser));

      toast({
        title: 'Profil mis a jour',
        description: 'Vos informations ont ete mises a jour avec succes',
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la mise a jour du profil';
      setError(errorMessage);

      toast({
        title: 'Erreur',
        description: errorMessage,
        variant: 'destructive'
      });

      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Ajout de la fonction changePassword
  const changePassword = async (currentPassword: string, newPassword: string) => {
    setIsLoading(true);
    setError(null);

    try {
      if (!user) throw new Error('Aucun utilisateur connecté');
      await AuthService.changePassword(user.id, currentPassword, newPassword);

      toast({
        title: 'Mot de passe modifié',
        description: 'Votre mot de passe a été modifié avec succès',
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors du changement de mot de passe';
      setError(errorMessage);

      toast({
        title: 'Erreur',
        description: errorMessage,
        variant: 'destructive'
      });

      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Ajout de la fonction register
  const register = async (userData: Partial<User>) => {
    setIsLoading(true);
    setError(null);

    try {
      const registeredUser = await AuthService.register(userData);
      setUser(registeredUser);
      localStorage.setItem('penda_user', JSON.stringify(registeredUser));

      toast({
        title: 'Inscription réussie',
        description: `Bienvenue, ${registeredUser.name}`,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors de l\'inscription';
      setError(errorMessage);

      toast({
        title: 'Erreur',
        description: errorMessage,
        variant: 'destructive'
      });

      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    updateProfile,
    changePassword,
    register,
    error,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};