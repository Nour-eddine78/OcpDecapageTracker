import { ZodError } from 'zod';

/**
 * Formate les erreurs Zod en un format plus lisible
 * @param error L'erreur ZodError à formater
 * @returns Un objet contenant les erreurs formatées
 */
export function formatZodError(error: ZodError) {
  const formattedErrors: Record<string, string> = {};

  error.errors.forEach((err) => {
    const path = err.path.join('.');
    formattedErrors[path] = err.message;
  });

  return formattedErrors;
}

/**
 * Valide un format de date ISO (YYYY-MM-DD)
 * @param dateString La chaîne de date à valider
 * @returns true si la date est valide, false sinon
 */
export function isValidISODate(dateString: string): boolean {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  
  if (!regex.test(dateString)) {
    return false;
  }
  
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
}

/**
 * Valide un email selon un format standard
 * @param email L'email à valider
 * @returns true si l'email est valide, false sinon
 */
export function isValidEmail(email: string): boolean {
  const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return regex.test(email);
}

/**
 * Valide un mot de passe selon des critères de complexité
 * @param password Le mot de passe à valider
 * @param minLength Longueur minimale requise (défaut: 8)
 * @returns Un objet avec un booléen isValid et un message d'erreur si non valide
 */
export function validatePassword(password: string, minLength = 8): { isValid: boolean; message?: string } {
  if (password.length < minLength) {
    return { 
      isValid: false, 
      message: `Le mot de passe doit contenir au moins ${minLength} caractères` 
    };
  }
  
  // Vérifier s'il contient au moins un chiffre
  if (!/\d/.test(password)) {
    return { 
      isValid: false, 
      message: 'Le mot de passe doit contenir au moins un chiffre' 
    };
  }
  
  // Vérifier s'il contient au moins une lettre majuscule
  if (!/[A-Z]/.test(password)) {
    return { 
      isValid: false, 
      message: 'Le mot de passe doit contenir au moins une lettre majuscule' 
    };
  }
  
  // Vérifier s'il contient au moins une lettre minuscule
  if (!/[a-z]/.test(password)) {
    return { 
      isValid: false, 
      message: 'Le mot de passe doit contenir au moins une lettre minuscule' 
    };
  }
  
  return { isValid: true };
}

/**
 * Nettoie une chaîne de caractères pour la sécurité
 * @param input La chaîne à nettoyer
 * @returns La chaîne nettoyée
 */
export function sanitizeString(input: string): string {
  // Supprimer les caractères potentiellement dangereux
  return input
    .replace(/<[^>]*>/g, '') // Supprimer les balises HTML
    .replace(/[^\w\s.,;:!?'"()[\]{}-]/g, ''); // Garder uniquement les caractères alphanumériques et la ponctuation commune
}

/**
 * Valide un identifiant d'objet (format OCP)
 * @param objectId L'identifiant à valider
 * @param prefix Le préfixe attendu (ex: 'MCH', 'OP', 'INC')
 * @returns true si l'identifiant est valide, false sinon
 */
export function isValidObjectId(objectId: string, prefix?: string): boolean {
  // Format: [PRÉFIXE]-[CHIFFRES]
  const regex = new RegExp(`^${prefix ? prefix + '-' : ''}\\d+$`);
  return regex.test(objectId);
}