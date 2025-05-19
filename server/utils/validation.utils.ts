import { ZodError } from 'zod';

/**
 * Formate les erreurs Zod en un format plus lisible
 * @param error L'erreur Zod à formater
 * @returns Un objet contenant les erreurs formatées
 */
export function formatZodError(error: ZodError) {
  const errors: Record<string, string> = {};
  
  error.errors.forEach(err => {
    const path = err.path.join('.');
    errors[path] = err.message;
  });
  
  return errors;
}

/**
 * Vérifie si une chaîne est un UUID valide
 * @param str La chaîne à vérifier
 * @returns true si c'est un UUID valide, false sinon
 */
export function isUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

/**
 * Vérifie si une chaîne est un email valide
 * @param email L'email à vérifier
 * @returns true si c'est un email valide, false sinon
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Formate une date en chaîne ISO
 * @param date La date à formater
 * @returns La date formatée en chaîne ISO
 */
export function formatDate(date: Date): string {
  return date.toISOString();
}

/**
 * Convertit une chaîne en nombre si possible
 * @param value La valeur à convertir
 * @param defaultValue Valeur par défaut si la conversion échoue
 * @returns Le nombre converti ou la valeur par défaut
 */
export function toNumber(value: string | undefined, defaultValue: number = 0): number {
  if (!value) return defaultValue;
  const parsed = Number(value);
  return isNaN(parsed) ? defaultValue : parsed;
}

/**
 * Convertit une chaîne en booléen
 * @param value La valeur à convertir
 * @param defaultValue Valeur par défaut si la conversion échoue
 * @returns Le booléen converti ou la valeur par défaut
 */
export function toBoolean(value: string | undefined, defaultValue: boolean = false): boolean {
  if (!value) return defaultValue;
  return value.toLowerCase() === 'true';
}