import { Request, Response } from 'express';
import { storage } from '../storage';
import { comparePassword, hashPassword, generateToken } from '../utils/auth.utils';
import { HTTP_STATUS, ERROR_MESSAGES } from '../config/constants';
import { SECURITY } from '../config/constants';
import { insertUserSchema } from '@shared/schema';

/**
 * Fonction de connexion d'un utilisateur
 * @param req Requête Express
 * @param res Réponse Express
 */
export async function login(req: Request, res: Response) {
  try {
    const { username, password } = req.body;
    
    // Vérifier que les identifiants sont fournis
    if (!username || !password) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({ 
        error: ERROR_MESSAGES.MISSING_CREDENTIALS 
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
    await storage.updateUser(user.id, { 
      lastLogin: new Date() 
    });
    
    // Générer un token JWT
    const token = generateToken(user);
    
    // Définir le cookie avec le token
    res.cookie(SECURITY.COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000 // 24 heures
    });
    
    // Envoyer la réponse
    res.status(HTTP_STATUS.OK).json({
      message: 'Connexion réussie',
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role
      },
      token
    });
  } catch (error) {
    console.error('Erreur de connexion:', error);
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
    // Valider les données avec Zod
    const validatedData = insertUserSchema.parse(req.body);
    
    // Vérifier si l'utilisateur existe déjà
    const existingUser = await storage.getUserByUsername(validatedData.username);
    
    if (existingUser) {
      return res.status(HTTP_STATUS.CONFLICT).json({ 
        error: ERROR_MESSAGES.USER_EXISTS 
      });
    }
    
    // Hacher le mot de passe
    const hashedPassword = await hashPassword(validatedData.password);
    
    // Créer l'utilisateur avec le mot de passe haché
    const user = await storage.createUser({
      ...validatedData,
      password: hashedPassword
    });
    
    // Envoyer la réponse sans le mot de passe
    res.status(HTTP_STATUS.CREATED).json({
      message: 'Utilisateur créé avec succès',
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Erreur lors de la création de l\'utilisateur:', error);
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
    // Récupérer le token du header ou des cookies
    let token: string | undefined;
    
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.headers[SECURITY.TOKEN_HEADER.toLowerCase()]) {
      token = req.headers[SECURITY.TOKEN_HEADER.toLowerCase()] as string;
    } else if (req.cookies && req.cookies[SECURITY.COOKIE_NAME]) {
      token = req.cookies[SECURITY.COOKIE_NAME];
    }
    
    // Si aucun token n'est trouvé, l'utilisateur n'est pas authentifié
    if (!token) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({ 
        authenticated: false 
      });
    }
    
    // Si un utilisateur est défini dans la requête (middleware authenticate)
    if (req.user) {
      return res.status(HTTP_STATUS.OK).json({
        authenticated: true,
        user: {
          id: req.user.id,
          username: req.user.username,
          name: req.user.name,
          role: req.user.role
        }
      });
    }
    
    // Si aucun utilisateur n'est défini dans la requête
    res.status(HTTP_STATUS.UNAUTHORIZED).json({ 
      authenticated: false 
    });
  } catch (error) {
    console.error('Erreur lors de la vérification de l\'authentification:', error);
    res.status(HTTP_STATUS.UNAUTHORIZED).json({ 
      authenticated: false 
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
    // Supprimer le cookie de session
    res.clearCookie(SECURITY.COOKIE_NAME);
    
    // Envoyer la réponse
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