import { Request, Response, NextFunction } from 'express';
import { HTTP_STATUS, ERROR_MESSAGES } from '../config/constants';
import { ZodError } from 'zod';
import { formatZodError } from '../utils/validation.utils';

/**
 * Middleware de gestion des erreurs
 * @param err Erreur Express
 * @param req Requête Express
 * @param res Réponse Express
 * @param next Fonction de passage au middleware suivant
 */
export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  console.error('Erreur:', err);
  
  // Gérer les différents types d'erreurs
  if (err instanceof ZodError) {
    // Erreur de validation Zod
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      error: ERROR_MESSAGES.VALIDATION_ERROR,
      details: formatZodError(err)
    });
  } else if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    // Erreur de token JWT
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({
      error: ERROR_MESSAGES.INVALID_TOKEN
    });
  } else if (err.status) {
    // Erreur avec un code de statut HTTP défini
    return res.status(err.status).json({
      error: err.message
    });
  }
  
  // Erreur générique
  res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
    error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR
  });
}

/**
 * Middleware pour gérer les routes inexistantes
 * @param req Requête Express
 * @param res Réponse Express
 */
export function notFoundHandler(req: Request, res: Response) {
  res.status(HTTP_STATUS.NOT_FOUND).json({
    error: `Route non trouvée: ${req.method} ${req.originalUrl}`
  });
}