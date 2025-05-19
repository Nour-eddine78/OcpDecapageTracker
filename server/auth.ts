
import { users } from '../shared/schema';
import { eq } from 'drizzle-orm';
import { JWT_SECRET, JWT_EXPIRES_IN, SECURITY } from './config/constants';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from './db';

export async function findUserById(id: number) {
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result[0] || null;
}

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(SECURITY.SALT_ROUNDS);
  return bcrypt.hash(password, salt);
}

export async function comparePassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export function generateToken(user: any): string {
  return jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

export function verifyToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET) as { id: number };
  } catch {
    return null;
  }
}

export async function validateUser(username: string, password: string) {
  const user = await db.select().from(users).where(eq(users.username, username)).limit(1);
  if (!user[0]) return null;
  const isValid = await comparePassword(password, user[0].password);
  return isValid ? user[0] : null;
}
