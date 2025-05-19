import { Request, Response, NextFunction } from 'express';
import { verifyToken, findUserById } from '../auth';

export async function authenticate(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Token manquant' });
    }

    const decoded: any = await verifyToken(token);
    const user = await findUserById(decoded.id);

    if (!user) {
      return res.status(401).json({ message: 'Utilisateur non trouvé' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Non autorisé' });
  }
}

export function authorizeAdmin(req: Request, res: Response, next: NextFunction) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Accès administrateur requis' });
  }
  next();
}

export function authorizeSupervisor(req: Request, res: Response, next: NextFunction) {
  if (!['admin', 'supervisor'].includes(req.user?.role)) {
    return res.status(403).json({ message: 'Accès superviseur requis' });
  }
  next();
}