import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '@shared/schema';
import { JWT_SECRET, JWT_EXPIRES_IN, SECURITY } from '../config/constants';

/**
 * Hache un mot de passe en utilisant bcrypt
 * @param password Le mot de passe à hacher
 * @returns Le mot de passe haché
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(SECURITY.PASSWORD_SALT_ROUNDS);
  return bcrypt.hash(password, salt);
}

/**
 * Compare un mot de passe avec un hash
 * @param password Le mot de passe à vérifier
 * @param hashedPassword Le mot de passe haché à comparer
 * @returns true si les mots de passe correspondent, false sinon
 */
export async function comparePassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

/**
 * Génère un token JWT à partir d'un utilisateur
 * @param user L'utilisateur pour lequel générer le token
 * @returns Le token JWT généré
 */
export function generateToken(user: User): string {
  const payload = {
    id: user.id,
    username: user.username,
    role: user.role
  };

  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

/**
 * Vérifie un token JWT
 * @param token Le token à vérifier
 * @returns Le payload décodé si le token est valide
 * @throws JsonWebTokenError si le token est invalide
 */
export function verifyToken(token: string): any {
  return jwt.verify(token, JWT_SECRET);
}

/**
 * Vérifie si un mot de passe est suffisamment fort
 * @param password Le mot de passe à vérifier
 * @returns true si le mot de passe est assez fort, false sinon
 */
export function isStrongPassword(password: string): boolean {
  // Au moins 8 caractères, 1 majuscule, 1 minuscule, 1 chiffre
  const strongRegex = new RegExp(
    `^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{${SECURITY.MINIMUM_PASSWORD_LENGTH},})`
  );
  return strongRegex.test(password);
}

/**
 * Génère un identifiant unique pour les objets
 * @param prefix Le préfixe à utiliser (ex: 'OP' pour opération)
 * @returns L'identifiant généré
 */
export function generateObjectId(prefix: string): string {
  const timestamp = new Date().getTime();
  const randomNum = Math.floor(Math.random() * 10000);
  return `${prefix}-${timestamp}-${randomNum}`;
}