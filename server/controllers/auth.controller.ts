import { Request, Response } from 'express';
import { storage } from '../storage';
import { hashPassword, comparePassword, generateToken } from '../utils/auth.utils';
import { HTTP_STATUS, ERROR_MESSAGES } from '../config/constants';
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

    // Vérifier que les champs requis sont présents
    if (!username || !password) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        error: 'Les champs username et password sont requis'
      });
    }

    // Récupérer l'utilisateur par son nom d'utilisateur
    const user = await storage.getUserByUsername(username);
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
    const now = new Date();
    await storage.updateUser(user.id, { lastLogin: now });

    // Générer un token JWT
    const token = generateToken(user);

    // Renvoyer les informations de l'utilisateur (sans le mot de passe) et le token
    res.status(HTTP_STATUS.OK).json({
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role,
        lastLogin: user.lastLogin
      },
      token
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
    // Valider les données avec Zod
    const userData = insertUserSchema.parse(req.body);

    // Vérifier si un utilisateur avec ce nom d'utilisateur existe déjà
    const existingUser = await storage.getUserByUsername(userData.username);
    if (existingUser) {
      return res.status(HTTP_STATUS.CONFLICT).json({
        error: ERROR_MESSAGES.USER_ALREADY_EXISTS
      });
    }

    // Hacher le mot de passe
    const hashedPassword = await hashPassword(userData.password);

    // Créer l'utilisateur
    const newUser = await storage.createUser({
      ...userData,
      password: hashedPassword
    });

    // Renvoyer l'utilisateur créé (sans le mot de passe)
    res.status(HTTP_STATUS.CREATED).json({
      user: {
        id: newUser.id,
        username: newUser.username,
        name: newUser.name,
        role: newUser.role,
        createdAt: newUser.createdAt
      }
    });
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
        authenticated: false
      });
    }

    res.status(HTTP_STATUS.OK).json({
      authenticated: true,
      user: {
        id: req.user.id,
        username: req.user.username,
        name: req.user.name,
        role: req.user.role,
        lastLogin: req.user.lastLogin
      }
    });
  } catch (error) {
    console.error('Erreur lors de la vérification d\'authentification:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR
    });
  }
}