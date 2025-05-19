import { Request, Response } from 'express';
import { storage } from '../storage';
import { HTTP_STATUS, ERROR_MESSAGES } from '../config/constants';
import { comparePassword, generateToken, hashPassword } from '../utils/auth.utils';
import { insertUserSchema } from '@shared/schema';
import { ZodError } from 'zod';
import { formatZodError } from '../utils/validation.utils';

/**
 * Fonction de connexion d'un utilisateur
 * @param req Requête Express
 * @param res Réponse Express
 */
export async function login(req: Request, res: Response) {
  try {
    const { username, password } = req.body;
    
    // Vérifier si les champs requis sont présents
    if (!username || !password) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        error: 'Le nom d\'utilisateur et le mot de passe sont requis'
      });
    }
    
    // Rechercher l'utilisateur dans la base de données
    const user = await storage.getUserByUsername(username);
    
    // Vérifier si l'utilisateur existe
    if (!user) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        error: ERROR_MESSAGES.INVALID_CREDENTIALS
      });
    }
    
    // Vérifier le mot de passe
    const isPasswordValid = await comparePassword(password, user.password);
    
    if (!isPasswordValid) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        error: ERROR_MESSAGES.INVALID_CREDENTIALS
      });
    }
    
    // Mettre à jour la date de dernière connexion
    const updatedUser = await storage.updateUser(user.id, {
      lastLogin: new Date()
    });
    
    // Générer un token JWT
    const token = generateToken(user);
    
    // Envoyer la réponse
    res.status(HTTP_STATUS.OK).json({
      token,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Erreur lors de la connexion:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR
    });
  }
}

/**
 * Fonction d'enregistrement d'un nouvel utilisateur (réservée aux administrateurs)
 * @param req Requête Express
 * @param res Réponse Express
 */
export async function register(req: Request, res: Response) {
  try {
    // Vérifier si l'utilisateur qui fait la demande est un administrateur
    if (!req.user || req.user.role !== 'admin') {
      return res.status(HTTP_STATUS.FORBIDDEN).json({
        error: ERROR_MESSAGES.ADMIN_REQUIRED
      });
    }
    
    // Valider les données avec Zod
    const userData = insertUserSchema.parse(req.body);
    
    // Vérifier si un utilisateur avec ce nom d'utilisateur existe déjà
    const existingUser = await storage.getUserByUsername(userData.username);
    if (existingUser) {
      return res.status(HTTP_STATUS.CONFLICT).json({
        error: 'Un utilisateur avec ce nom d\'utilisateur existe déjà'
      });
    }
    
    // S'assurer que le rôle est défini (valeur par défaut si non présent)
    if (!userData.role) {
      userData.role = 'utilisateur';
    }
    
    // Hacher le mot de passe
    userData.password = await hashPassword(userData.password);
    
    // Créer l'utilisateur
    const newUser = await storage.createUser(userData);
    
    // Masquer le mot de passe dans la réponse
    const { password, ...sanitizedUser } = newUser;
    
    res.status(HTTP_STATUS.CREATED).json(sanitizedUser);
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        error: 'Validation error',
        details: formatZodError(error)
      });
    }
    
    console.error('Erreur lors de l\'enregistrement:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR
    });
  }
}

/**
 * Fonction pour vérifier si un utilisateur est authentifié
 * @param req Requête Express
 * @param res Réponse Express
 */
export async function checkAuth(req: Request, res: Response) {
  try {
    if (!req.user) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        error: ERROR_MESSAGES.UNAUTHORIZED
      });
    }
    
    // L'utilisateur est authentifié, retourner ses informations
    res.status(HTTP_STATUS.OK).json({
      user: {
        id: req.user.id,
        username: req.user.username,
        name: req.user.name,
        role: req.user.role
      }
    });
  } catch (error) {
    console.error('Erreur lors de la vérification de l\'authentification:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR
    });
  }
}

/**
 * Fonction de déconnexion
 * @param req Requête Express
 * @param res Réponse Express
 */
export async function logout(req: Request, res: Response) {
  try {
    // Comme nous utilisons JWT, la déconnexion côté serveur n'est pas nécessaire
    // La déconnexion est gérée côté client en supprimant le token
    
    res.status(HTTP_STATUS.OK).json({
      message: 'Déconnexion réussie'
    });
  } catch (error) {
    console.error('Erreur lors de la déconnexion:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR
    });
  }
}