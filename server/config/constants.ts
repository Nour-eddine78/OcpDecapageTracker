/**
 * Fichier de constantes pour l'application
 * Centralise toutes les valeurs constantes pour faciliter la maintenance
 */

// Secret et durée de validité des tokens JWT
export const JWT_SECRET = process.env.JWT_SECRET || 'ocp_mining_operations_secret';
export const JWT_EXPIRES_IN = '24h';

// Codes de statut HTTP
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503
};

// Paramètres de sécurité
export const SECURITY = {
  COOKIE_NAME: 'ocp_auth_token',
  TOKEN_HEADER: 'X-Auth-Token',
  SALT_ROUNDS: 10
};

// Paramètres de limitation de débit
export const RATE_LIMIT = {
  LOGIN_MAX_ATTEMPTS: 5,
  LOGIN_WINDOW_MS: 15 * 60 * 1000, // 15 minutes
  STANDARD_WINDOW_MS: 60 * 1000, // 1 minute
  STANDARD_MAX_REQUESTS: 100
};

// Paramètres du serveur
export const SERVER = {
  PORT: process.env.PORT || 5000,
  ENV: process.env.NODE_ENV || 'development'
};

// Routes API
export const API_ROUTES = {
  AUTH: '/api/auth',
  USERS: '/api/users',
  MACHINES: '/api/machines',
  OPERATIONS: '/api/operations',
  SAFETY: '/api/safety'
};

// Messages d'erreur
export const ERROR_MESSAGES = {
  INTERNAL_SERVER_ERROR: 'Erreur interne du serveur',
  UNAUTHORIZED: 'Non autorisé',
  ADMIN_REQUIRED: 'Droits d\'administrateur requis',
  SUPERVISOR_REQUIRED: 'Droits de superviseur requis',
  MISSING_TOKEN: 'Token d\'authentification manquant',
  INVALID_TOKEN: 'Token d\'authentification invalide',
  MISSING_CREDENTIALS: 'Identifiants manquants',
  INVALID_CREDENTIALS: 'Identifiants invalides',
  USER_EXISTS: 'Cet utilisateur existe déjà',
  USER_NOT_FOUND: 'Utilisateur non trouvé',
  MACHINE_NOT_FOUND: 'Machine non trouvée',
  OPERATION_NOT_FOUND: 'Opération non trouvée',
  INCIDENT_NOT_FOUND: 'Incident de sécurité non trouvé',
  VALIDATION_ERROR: 'Erreur de validation des données'
};