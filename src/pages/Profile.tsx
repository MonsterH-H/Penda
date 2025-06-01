import { useState, useCallback, useMemo } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { 
  User, 
  Mail, 
  Building2, 
  Shield, 
  Save, 
  LogOut, 
  Eye, 
  EyeOff,
  CheckCircle,
  AlertCircle,
  Camera,
  Settings,
  Calendar,
  Phone,
  FileText,
  Lock,
  UserCheck,
  Sparkles
} from 'lucide-react';

// Types étendus pour inclure bio et phone
interface ExtendedUser {
  id?: string;
  name?: string;
  email?: string;
  company?: string;
  role?: string;
  phone?: string;
  bio?: string;
  avatar?: string;
  createdAt?: string;
  lastLogin?: string;
}

interface FormData {
  name: string;
  email: string;
  company: string;
  phone: string;
  bio: string;
}

interface PasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface PasswordValidation {
  length: boolean;
  uppercase: boolean;
  lowercase: boolean;
  number: boolean;
  special: boolean;
}

interface ShowPasswords {
  current: boolean;
  new: boolean;
  confirm: boolean;
}

const Profile = () => {
  const { user, updateProfile, logout } = useAuth();
  const { toast } = useToast();
  
  // Cast du user pour inclure les propriétés étendues
  const extendedUser = user as unknown as ExtendedUser;
  
  const [formData, setFormData] = useState<FormData>({
    name: extendedUser?.name || '',
    email: extendedUser?.email || '',
    company: extendedUser?.company || 'Penda Technologies',
    phone: extendedUser?.phone || '',
    bio: extendedUser?.bio || '',
  });
  
  const [passwordData, setPasswordData] = useState<PasswordData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState<ShowPasswords>({
    current: false,
    new: false,
    confirm: false
  });
  const [hasChanges, setHasChanges] = useState(false);

  // Validation du mot de passe en temps réel - avec dépendance corrigée
  const passwordValidation = useMemo((): PasswordValidation => {
    const { newPassword } = passwordData;
    return {
      length: newPassword.length >= 8,
      uppercase: /[A-Z]/.test(newPassword),
      lowercase: /[a-z]/.test(newPassword),
      number: /\d/.test(newPassword),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(newPassword),
    };
  }, [passwordData]); // Only need passwordData as dependency since newPassword is part of it

  const isPasswordValid = useMemo(() => {
    return Object.values(passwordValidation).every(Boolean);
  }, [passwordValidation]);

  const handleInputChange = useCallback((field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  }, []);

  const handlePasswordInputChange = useCallback((field: keyof PasswordData, value: string) => {
    setPasswordData(prev => ({ ...prev, [field]: value }));
  }, []);

  const togglePasswordVisibility = useCallback((field: keyof ShowPasswords) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  }, []);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.email.trim()) {
      toast({
        title: "Erreur de validation",
        description: "Le nom et l'email sont obligatoires",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      await updateProfile(formData);
      setHasChanges(false);
      toast({
        title: "✨ Profil mis à jour",
        description: "Vos informations ont été sauvegardées avec succès",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le profil",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!passwordData.currentPassword) {
      toast({
        title: "Erreur",
        description: "Veuillez saisir votre mot de passe actuel",
        variant: "destructive"
      });
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Erreur",
        description: "Les mots de passe ne correspondent pas",
        variant: "destructive"
      });
      return;
    }

    if (!isPasswordValid) {
      toast({
        title: "Erreur",
        description: "Le mot de passe ne respecte pas les critères de sécurité",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      // Simulation du changement de mot de passe
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      toast({
        title: "🔒 Mot de passe modifié",
        description: "Votre mot de passe a été mis à jour avec succès",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de modifier le mot de passe",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = useCallback(() => {
    logout();
    toast({
      title: "👋 À bientôt !",
      description: "Vous avez été déconnecté avec succès",
    });
  }, [logout, toast]);

  const resetForm = useCallback(() => {
    setFormData({
      name: extendedUser?.name || '',
      email: extendedUser?.email || '',
      company: extendedUser?.company || 'Penda Technologies',
      phone: extendedUser?.phone || '',
      bio: extendedUser?.bio || '',
    });
    setHasChanges(false);
  }, [extendedUser]);

  const getRoleColor = (role: string) => {
    switch (role?.toLowerCase()) {
      case 'admin': return 'bg-gradient-to-r from-red-500 to-pink-500 text-white';
      case 'manager': return 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white';
      case 'user': return 'bg-gradient-to-r from-green-500 to-emerald-500 text-white';
      default: return 'bg-gradient-to-r from-gray-500 to-slate-500 text-white';
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <AppLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="space-y-8 max-w-7xl mx-auto p-6">
          {/* En-tête Hero avec avatar amélioré */}
          <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl p-8 text-white shadow-2xl">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-32 translate-x-32"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 -translate-x-24"></div>
            
            <div className="relative flex items-center space-x-6">
              <div className="relative group">
                <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/30 shadow-xl group-hover:scale-105 transition-transform duration-300">
                  {extendedUser?.avatar ? (
                    <img 
                      src={extendedUser.avatar} 
                      alt={extendedUser.name} 
                      className="w-full h-full object-cover rounded-2xl"
                    />
                  ) : (
                    <span className="text-2xl font-bold">
                      {getInitials(extendedUser?.name || 'U')}
                    </span>
                  )}
                </div>
                <button className="absolute -bottom-2 -right-2 bg-white text-gray-800 rounded-xl p-2 hover:bg-gray-100 transition-all duration-200 shadow-lg hover:shadow-xl group-hover:scale-110">
                  <Camera className="w-4 h-4" />
                </button>
              </div>
              
              <div className="flex-1">
                <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
                  {extendedUser?.name || 'Utilisateur'}
                  <Sparkles className="w-6 h-6 text-yellow-300" />
                </h1>
                <p className="text-blue-100 text-lg mb-3">{extendedUser?.email}</p>
                <div className="flex items-center flex-wrap gap-3">
                  <Badge className={`${getRoleColor(extendedUser?.role || '')} shadow-lg`}>
                    <UserCheck className="w-4 h-4 mr-1" />
                    {extendedUser?.role || 'Utilisateur'}
                  </Badge>
                  <span className="text-blue-100">•</span>
                  <span className="text-blue-100 flex items-center bg-white/10 px-3 py-1 rounded-full">
                    <Calendar className="w-4 h-4 mr-2" />
                    Membre depuis janvier 2024
                  </span>
                  <span className="text-blue-100">•</span>
                  <span className="text-blue-100 flex items-center bg-white/10 px-3 py-1 rounded-full">
                    <Building2 className="w-4 h-4 mr-2" />
                    {extendedUser?.company || 'Entreprise'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Informations personnelles */}
            <div className="xl:col-span-2 space-y-8">
              <Card className="bg-white/90 backdrop-blur-lg shadow-xl border-0 rounded-2xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-500 rounded-xl">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-xl">Informations personnelles</CardTitle>
                        <CardDescription className="text-gray-600">
                          Modifiez vos informations de profil
                        </CardDescription>
                      </div>
                    </div>
                    {hasChanges && (
                      <Badge variant="outline" className="text-orange-600 border-orange-300 bg-orange-50 animate-pulse">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        Non sauvegardé
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="p-8">
                  <form onSubmit={handleProfileUpdate} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <Label htmlFor="name" className="text-sm font-semibold text-gray-700">
                          Nom complet *
                        </Label>
                        <div className="relative group">
                          <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                          <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => handleInputChange('name', e.target.value)}
                            placeholder="Votre nom complet"
                            className="pl-12 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl transition-all duration-200"
                            disabled={isLoading}
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="email" className="text-sm font-semibold text-gray-700">
                          Email *
                        </Label>
                        <div className="relative group">
                          <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                          <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            placeholder="votre@email.com"
                            className="pl-12 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl transition-all duration-200"
                            disabled={isLoading}
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="company" className="text-sm font-semibold text-gray-700">
                          Entreprise
                        </Label>
                        <div className="relative group">
                          <Building2 className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                          <Input
                            id="company"
                            value={formData.company}
                            onChange={(e) => handleInputChange('company', e.target.value)}
                            placeholder="Nom de l'entreprise"
                            className="pl-12 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl transition-all duration-200"
                            disabled={isLoading}
                          />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="phone" className="text-sm font-semibold text-gray-700">
                          Téléphone
                        </Label>
                        <div className="relative group">
                          <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                          <Input
                            id="phone"
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => handleInputChange('phone', e.target.value)}
                            placeholder="+33 1 23 45 67 89"
                            className="pl-12 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl transition-all duration-200"
                            disabled={isLoading}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="bio" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        Biographie
                      </Label>
                      <div className="relative">
                        <textarea
                          id="bio"
                          value={formData.bio}
                          onChange={(e) => handleInputChange('bio', e.target.value)}
                          placeholder="Parlez-nous de vous... Vos passions, votre expertise, vos objectifs..."
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all duration-200 min-h-[120px]"
                          disabled={isLoading}
                        />
                        <div className="absolute bottom-3 right-3 text-xs text-gray-400">
                          {formData.bio.length}/500
                        </div>
                      </div>
                    </div>

                    <div className="flex space-x-4 pt-4">
                      <Button
                        type="submit"
                        disabled={isLoading || !hasChanges}
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50"
                      >
                        <Save className="w-5 h-5 mr-2" />
                        {isLoading ? 'Sauvegarde...' : 'Sauvegarder les modifications'}
                      </Button>
                      
                      {hasChanges && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={resetForm}
                          disabled={isLoading}
                          className="px-6 py-3 rounded-xl border-gray-300 hover:bg-gray-50 transition-all duration-200"
                        >
                          Annuler
                        </Button>
                      )}
                    </div>
                  </form>
                </CardContent>
              </Card>

              {/* Sécurité améliorée */}
              <Card className="bg-white/90 backdrop-blur-lg shadow-xl border-0 rounded-2xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-100">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-green-500 rounded-xl">
                      <Shield className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">Sécurité du compte</CardTitle>
                      <CardDescription className="text-gray-600">
                        Modifiez votre mot de passe pour renforcer la sécurité
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-8">
                  <form onSubmit={handlePasswordChange} className="space-y-6">
                    <div className="space-y-3">
                      <Label htmlFor="currentPassword" className="text-sm font-semibold text-gray-700">
                        Mot de passe actuel
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <Input
                          id="currentPassword"
                          type={showPasswords.current ? "text" : "password"}
                          value={passwordData.currentPassword}
                          onChange={(e) => handlePasswordInputChange('currentPassword', e.target.value)}
                          placeholder="••••••••"
                          disabled={isLoading}
                          className="pl-12 pr-12 h-12 border-gray-200 focus:border-green-500 focus:ring-green-500 rounded-xl transition-all duration-200"
                        />
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility('current')}
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          {showPasswords.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="newPassword" className="text-sm font-semibold text-gray-700">
                        Nouveau mot de passe
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <Input
                          id="newPassword"
                          type={showPasswords.new ? "text" : "password"}
                          value={passwordData.newPassword}
                          onChange={(e) => handlePasswordInputChange('newPassword', e.target.value)}
                          placeholder="••••••••"
                          disabled={isLoading}
                          className="pl-12 pr-12 h-12 border-gray-200 focus:border-green-500 focus:ring-green-500 rounded-xl transition-all duration-200"
                        />
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility('new')}
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          {showPasswords.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                      
                      {/* Indicateurs de force du mot de passe améliorés */}
                      {passwordData.newPassword && (
                        <div className="bg-gray-50 p-4 rounded-xl space-y-3">
                          <h4 className="text-sm font-semibold text-gray-700">Critères de sécurité :</h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {Object.entries(passwordValidation).map(([key, isValid]) => (
                              <div key={key} className="flex items-center space-x-2">
                                {isValid ? (
                                  <CheckCircle className="w-4 h-4 text-green-500" />
                                ) : (
                                  <AlertCircle className="w-4 h-4 text-red-500" />
                                )}
                                <span className={`text-sm ${isValid ? 'text-green-600' : 'text-red-600'}`}>
                                  {key === 'length' && 'Au moins 8 caractères'}
                                  {key === 'uppercase' && 'Une majuscule'}
                                  {key === 'lowercase' && 'Une minuscule'}
                                  {key === 'number' && 'Un chiffre'}
                                  {key === 'special' && 'Un caractère spécial'}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="confirmPassword" className="text-sm font-semibold text-gray-700">
                        Confirmer le mot de passe
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <Input
                          id="confirmPassword"
                          type={showPasswords.confirm ? "text" : "password"}
                          value={passwordData.confirmPassword}
                          onChange={(e) => handlePasswordInputChange('confirmPassword', e.target.value)}
                          placeholder="••••••••"
                          disabled={isLoading}
                          className="pl-12 pr-12 h-12 border-gray-200 focus:border-green-500 focus:ring-green-500 rounded-xl transition-all duration-200"
                        />
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility('confirm')}
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          {showPasswords.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                      
                      {passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword && (
                        <p className="text-sm text-red-600 flex items-center bg-red-50 p-3 rounded-lg">
                          <AlertCircle className="w-4 h-4 mr-2" />
                          Les mots de passe ne correspondent pas
                        </p>
                      )}
                    </div>

                    <Button
                      type="submit"
                      disabled={isLoading || !passwordData.currentPassword || !isPasswordValid || passwordData.newPassword !== passwordData.confirmPassword}
                      className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50"
                    >
                      <Shield className="w-5 h-5 mr-2" />
                      {isLoading ? 'Modification en cours...' : 'Modifier le mot de passe'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Panneau latéral amélioré */}
            <div className="space-y-8">
              {/* Informations du compte */}
              <Card className="bg-white/90 backdrop-blur-lg shadow-xl border-0 rounded-2xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-purple-100">
                  <CardTitle className="flex items-center space-x-3 text-xl">
                    <div className="p-2 bg-purple-500 rounded-xl">
                      <Settings className="w-5 h-5 text-white" />
                    </div>
                    <span>Informations du compte</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                      <span className="text-sm font-medium text-gray-600">Rôle</span>
                      <Badge className={getRoleColor(extendedUser?.role || '')}>
                        <UserCheck className="w-3 h-3 mr-1" />
                        {extendedUser?.role || 'Utilisateur'}
                      </Badge>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-3">
                      <div className="flex justify-between items-start">
                        <span className="text-sm font-medium text-gray-600">Email</span>
                        <span className="text-sm text-gray-900 text-right max-w-[150px] break-words">
                          {extendedUser?.email}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-start">
                        <span className="text-sm font-medium text-gray-600">Entreprise</span>
                        <span className="text-sm text-gray-900 text-right max-w-[150px] break-words">
                          {extendedUser?.company || 'Non définie'}
                        </span>
                      </div>

                      {extendedUser?.phone && (
                        <div className="flex justify-between items-start">
                          <span className="text-sm font-medium text-gray-600">Téléphone</span>
                          <span className="text-sm text-gray-900 text-right max-w-[150px] break-words">
                            {extendedUser.phone}
                          </span>
                        </div>
                      )}
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-600">Statut</span>
                        <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Actif
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <Separator />
                  
                  <Button
                    onClick={handleLogout}
                    variant="destructive"
                    className="w-full bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    <LogOut className="w-5 h-5 mr-2" />
                    Se déconnecter
                  </Button>
                </CardContent>
              </Card>

              {/* Conseils de sécurité modernisés */}
              <Card className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border-0 rounded-2xl overflow-hidden shadow-xl">
                <CardHeader className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-b border-blue-200/50">
                  <CardTitle className="text-blue-800 flex items-center space-x-3">
                    <div className="p-2 bg-blue-500 rounded-xl">
                      <Shield className="w-5 h-5 text-white" />
                    </div>
                    <span>Conseils de sécurité</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4 text-sm text-blue-700">
                    <div className="flex items-start space-x-3 p-3 bg-white/50 rounded-xl">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Mot de passe fort</p>
                        <p className="text-xs text-blue-600">Utilisez un mot de passe unique et complexe</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3 p-3 bg-white/50 rounded-xl">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Authentification 2FA</p>
                        <p className="text-xs text-blue-600">Activez la double authentification</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3 p-3 bg-white/50 rounded-xl">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Vérifications régulières</p>
                        <p className="text-xs text-blue-600">Contrôlez vos informations mensuellement</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3 p-3 bg-white/50 rounded-xl">
                      <AlertCircle className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Confidentialité</p>
                        <p className="text-xs text-blue-600">Ne partagez jamais vos identifiants</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Statistiques d'activité */}
              <Card className="bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 border-0 rounded-2xl overflow-hidden shadow-xl">
                <CardHeader className="bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border-b border-emerald-200/50">
                  <CardTitle className="text-emerald-800 flex items-center space-x-3">
                    <div className="p-2 bg-emerald-500 rounded-xl">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <span>Activité récente</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-white/60 rounded-xl">
                      <span className="text-sm font-medium text-emerald-700">Dernière connexion</span>
                      <span className="text-sm text-emerald-600">Aujourd'hui</span>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 bg-white/60 rounded-xl">
                      <span className="text-sm font-medium text-emerald-700">Sessions actives</span>
                      <Badge className="bg-emerald-100 text-emerald-700">1</Badge>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 bg-white/60 rounded-xl">
                      <span className="text-sm font-medium text-emerald-700">Profil complété</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-16 h-2 bg-emerald-200 rounded-full overflow-hidden">
                          <div className="w-3/4 h-full bg-gradient-to-r from-emerald-500 to-teal-500"></div>
                        </div>
                        <span className="text-sm text-emerald-600">75%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Profile;