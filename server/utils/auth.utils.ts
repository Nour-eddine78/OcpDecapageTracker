import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { JWT_SECRET, JWT_EXPIRES_IN, SECURITY } from '../config/constants';
import { User } from '@shared/schema';
import crypto from 'crypto';

/**
 * Hache un mot de passe en utilisant bcrypt
 * @param password Le mot de passe à hacher
 * @returns Le mot de passe haché
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(SECURITY.SALT_ROUNDS);
  return bcrypt.hash(password, salt);
}

/**
 * Compare un mot de passe en clair avec un mot de passe haché
 * @param password Le mot de passe en clair
 * @param hashedPassword Le mot de passe haché
 * @returns true si les mots de passe correspondent, false sinon
 */
export async function comparePassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

/**
 * Génère un token JWT pour un utilisateur
 * @param user L'utilisateur pour lequel générer le token
 * @returns Le token JWT généré
 */
export function generateToken(user: User): string {
  const payload = {
    id: user.id,
    username: user.username,
    name: user.name,
    role: user.role
  };
  
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

/**
 * Vérifie et décode un token JWT
 * @param token Le token JWT à vérifier
 * @returns Le payload décodé du token si valide
 */
export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error('Token invalide ou expiré');
  }
}

/**
 * Génère un identifiant unique pour les objets (machines, opérations, incidents)
 * @param prefix Préfixe à utiliser (ex: MCH pour machine)
 * @returns Identifiant unique formaté
 */
export function generateObjectId(prefix: string): string {
  const timestamp = Date.now().toString().slice(-5);
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `${prefix}-${timestamp}${random}`;
}

/**
 * Génère un jeton de réinitialisation de mot de passe
 * @returns Jeton de réinitialisation
 */
export function generateResetToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Vérifie si un utilisateur est administrateur
 * @param user L'utilisateur à vérifier
 * @returns true si l'utilisateur est administrateur, false sinon
 */
export function isAdmin(user: User): boolean {
  return user.role === 'admin';
}

/**
 * Vérifie si un utilisateur est superviseur
 * @param user L'utilisateur à vérifier
 * @returns true si l'utilisateur est superviseur, false sinon
 */
export function isSupervisor(user: User): boolean {
  return user.role === 'superviseur' || user.role === 'admin';
}