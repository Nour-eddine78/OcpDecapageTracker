import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { db } from './db';
import { users } from '../shared/schema';
import { eq } from 'drizzle-orm';
import { JWT_SECRET, JWT_EXPIRES_IN, SECURITY } from './config/constants';

export async function validateUser(username: string, password: string) {
  const user = await db.select().from(users).where(eq(users.username, username)).limit(1);
  if (!user.length) return null;

  const valid = await bcrypt.compare(password, user[0].password);
  if (!valid) return null;

  return user[0];
}

export function generateToken(userId: number, role: string) {
  return jwt.sign({ id: userId, role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
}