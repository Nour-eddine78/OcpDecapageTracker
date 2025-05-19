
import { users } from '../shared/schema';
import { eq } from 'drizzle-orm';
import { JWT_SECRET, JWT_EXPIRES_IN, SECURITY } from './config/constants';
import { db } from './db';
import jwt from 'jsonwebtoken';

export async function findUserById(id: number) {
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result[0] || null;
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
  // Add password validation logic here
  return user[0];
}
