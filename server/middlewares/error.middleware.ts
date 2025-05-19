import { Request, Response, NextFunction } from 'express';
import { HTTP_STATUS, ERROR_MESSAGES } from '../config/constants';
import { ZodError } from 'zod';
import { formatZodError } from '../utils/validation.utils';

/**
 * Middleware de gestion globale des erreurs
 * @param err L'erreur interceptée
 * @param req Requête Express
 * @param res Réponse Express
 * @param next Fonction next
 */
export const errorHandler = (
  err: Error, 
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  console.error('Erreur interceptée par le middleware:', err);

  // Gestion des erreurs Zod (validation)
  if (err instanceof ZodError) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      error: 'Validation error',
      details: formatZodError(err)
    });
  }

  // Gestion des erreurs JWT
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({
      error: ERROR_MESSAGES.INVALID_TOKEN
    });
  }

  // Erreur 404 pour les ressources non trouvées
  if (err.message.includes('not found') || err.message.includes('non trouvé')) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({
      error: err.message
    });
  }

  // Gestion des erreurs liées à un conflit (doublon)
  if (err.message.includes('duplicate') || err.message.includes('already exists') || err.message.includes('existe déjà')) {
    return res.status(HTTP_STATUS.CONFLICT).json({
      error: err.message
    });
  }

  // Erreur par défaut (500)
  return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
    error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
};

/**
 * Middleware pour gérer les routes non trouvées
 * @param req Requête Express
 * @param res Réponse Express
 */
export const notFoundHandler = (req: Request, res: Response) => {
  res.status(HTTP_STATUS.NOT_FOUND).json({
    error: `Route ${req.method} ${req.originalUrl} non trouvée`
  });
};