import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from 'ws';
import * as schema from '@shared/schema';

// Configuration pour les connexions WebSocket nécessaires pour Neon Database
neonConfig.webSocketConstructor = ws;

// Vérification de la présence de la variable d'environnement DATABASE_URL
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL doit être défini dans les variables d\'environnement');
}

// Création du pool de connexions
export const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Création de l'instance Drizzle avec le schéma défini
export const db = drizzle(pool, { schema });

// Fonction pour tester la connexion à la base de données
export async function testConnection() {
  try {
    const result = await pool.query('SELECT NOW()');
    console.log('Connexion à la base de données établie avec succès', result.rows[0]);
    return true;
  } catch (error) {
    console.error('Erreur de connexion à la base de données:', error);
    return false;
  }
}