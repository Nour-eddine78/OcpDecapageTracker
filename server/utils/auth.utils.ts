import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { JWT_SECRET, JWT_EXPIRES_IN } from '../config/constants';
import { User } from '@shared/schema';

/**
 * Hachage d'un mot de passe avec bcrypt
 * @param password Mot de passe en clair
 * @returns Mot de passe haché
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

/**
 * Comparaison d'un mot de passe en clair avec un mot de passe haché
 * @param password Mot de passe en clair
 * @param hashedPassword Mot de passe haché
 * @returns true si le mot de passe correspond, false sinon
 */
export async function comparePassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

/**
 * Génération d'un token JWT pour un utilisateur
 * @param user Objet utilisateur
 * @returns Token JWT
 */
export function generateToken(user: User): string {
  const payload = {
    id: user.id,
    username: user.username,
    name: user.name,
    role: user.role
  };
  
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN
  });
}

/**
 * Vérification et décodage d'un token JWT
 * @param token Token JWT
 * @returns Données décodées du token
 * @throws Error si le token est invalide
 */
export function verifyToken(token: string): any {
  return jwt.verify(token, JWT_SECRET);
}

/**
 * Vérification si un utilisateur est administrateur
 * @param user Objet utilisateur
 * @returns true si l'utilisateur est administrateur, false sinon
 */
export function isAdmin(user: User): boolean {
  return user.role === 'admin';
}

/**
 * Vérification si un utilisateur est superviseur
 * @param user Objet utilisateur
 * @returns true si l'utilisateur est superviseur, false sinon
 */
export function isSupervisor(user: User): boolean {
  return user.role === 'superviseur' || user.role === 'admin';
}