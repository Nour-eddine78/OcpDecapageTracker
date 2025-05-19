
import pkg from 'pg';
const { Pool } = pkg;
import * as schema from '../../shared/schema';
import { drizzle } from 'drizzle-orm/node-postgres';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL doit être défini dans les variables d\'environnement');
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10
});

export const db = drizzle(pool, { schema });

export async function testConnection() {
  try {
    const result = await pool.query('SELECT NOW()');
    console.log('Connexion à la base de données établie:', result.rows[0].now);
    return true;
  } catch (error) {
    console.error('Erreur de connexion à la base de données:', error);
    return false;
  }
}
