// Configuration des constantes de l'application
export const JWT_SECRET = process.env.JWT_SECRET || 'ocp_mining_operations_secret';
export const JWT_EXPIRES_IN = '24h';

// Configuration des codes d'erreur HTTP
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500
};

// Configuration des paramètres de sécurité
export const SECURITY = {
  PASSWORD_SALT_ROUNDS: 10,
  MINIMUM_PASSWORD_LENGTH: 8
};

// Configuration des limites de requêtes
export const RATE_LIMIT = {
  WINDOW_MS: 15 * 60 * 1000, // 15 minutes
  MAX_REQUESTS: 100 // maximum de requêtes par window
};

// Configuration du serveur
export const SERVER = {
  PORT: process.env.PORT || 5000,
  HOST: process.env.HOST || '0.0.0.0'
};

// Configuration des routes API
export const API_ROUTES = {
  BASE: '/api',
  AUTH: '/api/auth',
  USERS: '/api/users',
  MACHINES: '/api/machines',
  OPERATIONS: '/api/operations',
  SAFETY: '/api/safety',
  STATS: '/api/stats'
};

// Configuration des messages d'erreur
export const ERROR_MESSAGES = {
  INVALID_CREDENTIALS: 'Identifiants invalides',
  USER_NOT_FOUND: 'Utilisateur non trouvé',
  USER_ALREADY_EXISTS: 'Un utilisateur avec cet identifiant existe déjà',
  UNAUTHORIZED: 'Accès non autorisé',
  FORBIDDEN: 'Accès interdit',
  MISSING_TOKEN: 'Token d\'authentification manquant',
  INVALID_TOKEN: 'Token d\'authentification invalide',
  INTERNAL_SERVER_ERROR: 'Erreur interne du serveur',
  MACHINE_NOT_FOUND: 'Machine non trouvée',
  OPERATION_NOT_FOUND: 'Opération non trouvée',
  SAFETY_INCIDENT_NOT_FOUND: 'Incident de sécurité non trouvé'
};