import { User } from '@/types/user';

// Simuler une base de donnu00e9es d'utilisateurs pour la du00e9monstration
const USERS_DB: User[] = [
  {
    id: '1',
    email: 'admin@penda.com',
    password: 'admin123', // En production, utiliser des mots de passe hachu00e9s
    name: 'Administrateur Penda',
    role: 'admin',
    company: 'Penda Technologies',
    createdAt: new Date('2024-01-01'),
    settings: {
      darkMode: false,
      notifications: true,
      language: 'fr'
    }
  },
  {
    id: '2',
    email: 'operateur@penda.com',
    password: 'operator123',
    name: 'Opu00e9rateur Test',
    role: 'operator',
    company: 'Penda Technologies',
    createdAt: new Date('2024-02-15'),
    settings: {
      darkMode: true,
      notifications: true,
      language: 'fr'
    }
  },
  {
    id: '3',
    email: 'visiteur@penda.com',
    password: 'viewer123',
    name: 'Visiteur Test',
    role: 'viewer',
    company: 'Entreprise Cliente',
    createdAt: new Date('2024-03-10'),
    settings: {
      darkMode: false,
      notifications: false,
      language: 'fr'
    }
  }
];

export class AuthService {
  /**
   * Authentifie un utilisateur avec son email et mot de passe
   */
  static async login(email: string, password: string): Promise<User> {
    // Simuler un du00e9lai ru00e9seau
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const user = USERS_DB.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    
    if (!user) {
      throw new Error('Identifiants invalides');
    }
    
    // Ne pas renvoyer le mot de passe au client
    const { password: _, ...userWithoutPassword } = user;
    
    return userWithoutPassword as User;
  }
  
  /**
   * Enregistre un nouvel utilisateur
   */
  static async register(userData: Partial<User>): Promise<User> {
    // Simuler un du00e9lai ru00e9seau
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Vu00e9rifier si l'email existe du00e9ju00e0
    if (USERS_DB.some(u => u.email.toLowerCase() === userData.email?.toLowerCase())) {
      throw new Error('Cet email est du00e9ju00e0 utilisu00e9');
    }
    
    // Cru00e9er un nouvel utilisateur
    const newUser: User = {
      id: `${USERS_DB.length + 1}`,
      email: userData.email || '',
      password: userData.password || '',
      name: userData.name || 'Utilisateur',
      role: userData.role || 'viewer',
      company: userData.company || 'Non spu00e9cifiu00e9e',
      createdAt: new Date(),
      settings: {
        darkMode: false,
        notifications: true,
        language: 'fr'
      }
    };
    
    // Ajouter u00e0 notre "base de donnu00e9es"
    USERS_DB.push(newUser);
    
    // Ne pas renvoyer le mot de passe au client
    const { password: _, ...userWithoutPassword } = newUser;
    
    return userWithoutPassword as User;
  }
  
  /**
   * Met u00e0 jour les informations d'un utilisateur
   */
  static async updateProfile(userId: string, userData: Partial<User>): Promise<User> {
    // Simuler un du00e9lai ru00e9seau
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const userIndex = USERS_DB.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
      throw new Error('Utilisateur non trouvu00e9');
    }
    
    // Mettre u00e0 jour les champs fournis
    USERS_DB[userIndex] = {
      ...USERS_DB[userIndex],
      ...userData,
      // Ne pas permettre de changer ces champs
      id: USERS_DB[userIndex].id,
      createdAt: USERS_DB[userIndex].createdAt
    };
    
    // Ne pas renvoyer le mot de passe au client
    const { password: _, ...userWithoutPassword } = USERS_DB[userIndex];
    
    return userWithoutPassword as User;
  }
  
  /**
   * Change le mot de passe d'un utilisateur
   */
  static async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<boolean> {
    // Simuler un du00e9lai ru00e9seau
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const userIndex = USERS_DB.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
      throw new Error('Utilisateur non trouvu00e9');
    }
    
    // Vu00e9rifier l'ancien mot de passe
    if (USERS_DB[userIndex].password !== currentPassword) {
      throw new Error('Mot de passe actuel incorrect');
    }
    
    // Mettre u00e0 jour le mot de passe
    USERS_DB[userIndex].password = newPassword;
    
    return true;
  }
  
  /**
   * Ru00e9cupu00e8re tous les utilisateurs (admin uniquement)
   */
  static async getAllUsers(requestingUserId: string): Promise<Omit<User, 'password'>[]> {
    // Simuler un du00e9lai ru00e9seau
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const requestingUser = USERS_DB.find(u => u.id === requestingUserId);
    
    if (!requestingUser || requestingUser.role !== 'admin') {
      throw new Error('Accu00e8s non autorisu00e9');
    }
    
    // Retourner tous les utilisateurs sans leurs mots de passe
    return USERS_DB.map(({ password: _, ...user }) => user as User);
  }
}
