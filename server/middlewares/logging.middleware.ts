import { Request, Response, NextFunction } from 'express';

/**
 * Middleware de journalisation des requêtes HTTP
 * @param req Requête Express
 * @param res Réponse Express
 * @param next Fonction de passage au middleware suivant
 */
export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();
  
  // Journaliser la requête
  console.log(`${new Date().toISOString()} | ${req.method} ${req.url} [STARTED]`);
  
  // Une fois que la réponse est terminée
  res.on('finish', () => {
    const duration = Date.now() - start;
    const contentLength = res.getHeader('content-length') || 0;
    const userIdOrGuest = req.user ? `[User: ${req.user.id}]` : '[Guest]';
    
    // Journaliser les détails de la réponse
    console.log(
      `${new Date().toISOString()} | ${req.method} ${req.url} [COMPLETED] ${userIdOrGuest} - ${res.statusCode} - ${duration}ms - ${contentLength} bytes`
    );
  });
  
  // Une fois que la réponse est fermée (en cas d'erreur ou d'interruption)
  res.on('close', () => {
    if (!res.writableEnded) {
      const duration = Date.now() - start;
      console.log(
        `${new Date().toISOString()} | ${req.method} ${req.url} [CLOSED PREMATURELY] - ${duration}ms`
      );
    }
  });
  
  next();
}

/**
 * Middleware pour limiter les requêtes par IP (protection contre les attaques par force brute)
 * Utilise une Map en mémoire pour stocker les tentatives par IP
 */
const loginAttempts = new Map<string, { count: number, lastAttempt: number }>();
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_TIME = 15 * 60 * 1000; // 15 minutes

export function loginRateLimiter(req: Request, res: Response, next: NextFunction) {
  // Uniquement pour les routes de login
  if (req.path !== '/api/auth/login') {
    return next();
  }
  
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  
  // Vérifier les tentatives précédentes
  const attempts = loginAttempts.get(ip);
  
  // Si l'IP est verrouillée
  if (attempts && attempts.count >= MAX_LOGIN_ATTEMPTS) {
    const timeElapsed = now - attempts.lastAttempt;
    
    // Si le temps de verrouillage n'est pas encore écoulé
    if (timeElapsed < LOCKOUT_TIME) {
      const remainingTime = Math.ceil((LOCKOUT_TIME - timeElapsed) / 1000 / 60);
      return res.status(429).json({
        error: `Trop de tentatives de connexion. Veuillez réessayer dans ${remainingTime} minutes.`
      });
    }
    
    // Réinitialiser les tentatives après la période de verrouillage
    loginAttempts.delete(ip);
  }
  
  // Stocker cette tentative pour les vérifications futures
  const originalEnd = res.end;
  res.end = function (this: Response, ...args: any[]) {
    // Uniquement incrémenter le compteur en cas d'échec de connexion
    if (res.statusCode !== 200) {
      if (attempts) {
        loginAttempts.set(ip, {
          count: attempts.count + 1,
          lastAttempt: now
        });
      } else {
        loginAttempts.set(ip, {
          count: 1,
          lastAttempt: now
        });
      }
    } else {
      // Réinitialiser en cas de connexion réussie
      loginAttempts.delete(ip);
    }
    
    return originalEnd.apply(this, args);
  };
  
  next();
}