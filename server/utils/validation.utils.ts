import { ZodError } from 'zod';

/**
 * Formatte les erreurs de validation Zod en un format plus lisible
 * @param error L'erreur Zod
 * @returns Un objet avec les champs en erreur et les messages associés
 */
export function formatZodError(error: ZodError): Record<string, string> {
  const formattedErrors: Record<string, string> = {};
  
  error.errors.forEach((err) => {
    const path = err.path.join('.');
    formattedErrors[path] = err.message;
  });
  
  return formattedErrors;
}

/**
 * Vérifie si une chaîne est un identifiant valide
 * @param id Identifiant à vérifier
 * @returns true si l'identifiant est valide, false sinon
 */
export function isValidId(id: string): boolean {
  return /^[a-zA-Z0-9_-]+$/.test(id);
}

/**
 * Génère un identifiant aléatoire pour une opération/machine/incident
 * @param prefix Préfixe de l'identifiant (ex: 'OP', 'MACH', 'INC')
 * @returns Identifiant aléatoire au format PREFIX-XXXXX-XXXXX
 */
export function generateId(prefix: string): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let part1 = '';
  let part2 = '';
  
  for (let i = 0; i < 5; i++) {
    part1 += chars.charAt(Math.floor(Math.random() * chars.length));
    part2 += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  const timestamp = Date.now().toString().slice(-4);
  return `${prefix}-${part1}-${part2}-${timestamp}`;
}

/**
 * Convertit une valeur en nombre
 * @param value Valeur à convertir
 * @param defaultValue Valeur par défaut si la conversion échoue
 * @returns Le nombre converti ou la valeur par défaut
 */
export function toNumber(value: any, defaultValue: number = 0): number {
  const parsed = Number(value);
  return isNaN(parsed) ? defaultValue : parsed;
}

/**
 * Sanitize les entrées de texte pour éviter les injections
 * @param text Texte à sanitizer
 * @returns Texte sanitizé
 */
export function sanitizeText(text: string): string {
  if (!text) return '';
  
  // Supprimer les tags HTML dangereux et les caractères spéciaux
  return text
    .replace(/<[^>]*>/g, '')
    .replace(/[<>]/g, '')
    .trim();
}