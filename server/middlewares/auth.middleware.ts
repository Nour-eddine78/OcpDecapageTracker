import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JWT_SECRET, HTTP_STATUS, ERROR_MESSAGES } from '../config/constants';
import { storage } from '../storage';

/**
 * Middleware pour vérifier l'authentification des utilisateurs
 * @param req Requête Express
 * @param res Réponse Express
 * @param next Fonction next
 */
export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Récupérer le token depuis l'en-tête Authorization
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({ 
        error: ERROR_MESSAGES.MISSING_TOKEN 
      });
    }

    // Extraire et vérifier le token
    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({ 
        error: ERROR_MESSAGES.MISSING_TOKEN 
      });
    }

    // Vérifier et décoder le token
    const decoded = jwt.verify(token, JWT_SECRET) as { id: number };
    if (!decoded || !decoded.id) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({ 
        error: ERROR_MESSAGES.INVALID_TOKEN 
      });
    }

    // Récupérer l'utilisateur
    const user = await storage.getUser(decoded.id);
    if (!user) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({ 
        error: ERROR_MESSAGES.USER_NOT_FOUND 
      });
    }

    // Ajouter l'utilisateur à l'objet requête
    req.user = user;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({ 
        error: ERROR_MESSAGES.INVALID_TOKEN 
      });
    }
    console.error('Erreur d\'authentification:', error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ 
      error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR 
    });
  }
};

/**
 * Middleware pour restreindre l'accès aux administrateurs
 * @param req Requête Express
 * @param res Réponse Express
 * @param next Fonction next
 */
export const authorizeAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(HTTP_STATUS.FORBIDDEN).json({ 
      error: ERROR_MESSAGES.FORBIDDEN 
    });
  }
  next();
};

/**
 * Middleware pour restreindre l'accès aux superviseurs et administrateurs
 * @param req Requête Express
 * @param res Réponse Express
 * @param next Fonction next
 */
export const authorizeSupervisor = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user || (req.user.role !== 'supervisor' && req.user.role !== 'admin')) {
    return res.status(HTTP_STATUS.FORBIDDEN).json({ 
      error: ERROR_MESSAGES.FORBIDDEN 
    });
  }
  next();
};