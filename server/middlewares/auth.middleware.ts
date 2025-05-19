import { Request, Response, NextFunction } from 'express';
import { verifyToken, isAdmin } from '../utils/auth.utils';
import { HTTP_STATUS, ERROR_MESSAGES, SECURITY } from '../config/constants';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        username: string;
        name: string;
        role: string;
      };
    }
  }
}

/**
 * Middleware d'authentification pour vérifier si l'utilisateur est connecté
 * @param req Requête Express
 * @param res Réponse Express
 * @param next Fonction de passage au middleware suivant
 */
export async function authenticate(req: Request, res: Response, next: NextFunction) {
  try {
    // Récupérer le token du header ou des cookies
    let token: string | undefined;
    
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      // Récupérer depuis le header Authorization
      token = req.headers.authorization.split(' ')[1];
    } else if (req.headers[SECURITY.TOKEN_HEADER.toLowerCase()]) {
      // Récupérer depuis un header personnalisé
      token = req.headers[SECURITY.TOKEN_HEADER.toLowerCase()] as string;
    } else if (req.cookies && req.cookies[SECURITY.COOKIE_NAME]) {
      // Récupérer depuis les cookies
      token = req.cookies[SECURITY.COOKIE_NAME];
    }
    
    // Vérifier si le token existe
    if (!token) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        error: ERROR_MESSAGES.MISSING_TOKEN
      });
    }
    
    // Vérifier et décoder le token
    const decoded = verifyToken(token);
    
    // Ajouter les informations de l'utilisateur à la requête
    req.user = {
      id: decoded.id,
      username: decoded.username,
      name: decoded.name,
      role: decoded.role
    };
    
    next();
  } catch (error) {
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({
      error: ERROR_MESSAGES.INVALID_TOKEN
    });
  }
}

/**
 * Middleware pour vérifier si l'utilisateur est administrateur
 * @param req Requête Express
 * @param res Réponse Express
 * @param next Fonction de passage au middleware suivant
 */
export function authorizeAdmin(req: Request, res: Response, next: NextFunction) {
  // Vérifier si l'utilisateur est authentifié
  if (!req.user) {
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({
      error: ERROR_MESSAGES.UNAUTHORIZED
    });
  }
  
  // Vérifier si l'utilisateur est administrateur
  if (req.user.role !== 'admin') {
    return res.status(HTTP_STATUS.FORBIDDEN).json({
      error: ERROR_MESSAGES.ADMIN_REQUIRED
    });
  }
  
  next();
}

/**
 * Middleware pour vérifier si l'utilisateur est superviseur
 * @param req Requête Express
 * @param res Réponse Express
 * @param next Fonction de passage au middleware suivant
 */
export function authorizeSupervisor(req: Request, res: Response, next: NextFunction) {
  // Vérifier si l'utilisateur est authentifié
  if (!req.user) {
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({
      error: ERROR_MESSAGES.UNAUTHORIZED
    });
  }
  
  // Vérifier si l'utilisateur est superviseur ou administrateur
  if (req.user.role !== 'superviseur' && req.user.role !== 'admin') {
    return res.status(HTTP_STATUS.FORBIDDEN).json({
      error: 'Droits de superviseur requis pour cette action'
    });
  }
  
  next();
}