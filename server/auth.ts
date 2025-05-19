import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { db } from './config/database';
import { users } from '../shared/schema';
import { eq } from 'drizzle-orm';
import { Request, Response, NextFunction } from 'express';

const JWT_SECRET = process.env.JWT_SECRET || 'ocp-decapage-secret-key';
const JWT_EXPIRES_IN = '24h';

export async function generateToken(user: any) {
  return jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

export async function verifyToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error('Token invalide');
  }
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hashedPassword: string) {
  return bcrypt.compare(password, hashedPassword);
}

export async function findUserById(id: number) {
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result[0];
}

export async function findUserByUsername(username: string) {
  const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
  return result[0];
}

// Authentication middleware
export async function authenticate(req: Request, res: Response, next: NextFunction) {
  try {
    // Get token from authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Accès non autorisé: Token manquant' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = await verifyToken(token);

    if (!decoded) {
      return res.status(401).json({ message: 'Accès non autorisé: Token invalide' });
    }

    // Get user from database
    const user = await findUserById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: 'Accès non autorisé: Utilisateur non trouvé' });
    }

    // Add user to request object
    (req as any).user = user;
    next();
  } catch (error: any) {
    console.error('Authentication error:', error);
    return res.status(500).json({ message: error.message || 'Erreur d\'authentification' });
  }
}

// Admin authorization middleware
export function authorizeAdmin(req: Request, res: Response, next: NextFunction) {
  const user = (req as any).user;
  
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ message: 'Accès interdit: Droits d\'administrateur requis' });
  }
  
  next();
}