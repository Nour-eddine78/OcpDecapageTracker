/**
 * Constantes pour l'application de gestion des opérations de décapage OCP
 */

// Secret JWT pour la signature des tokens
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
  INTERNAL_SERVER_ERROR: 500
};

// Paramètres de sécurité
export const SECURITY = {
  SALT_ROUNDS: 10,
  MIN_PASSWORD_LENGTH: 8,
  TOKEN_HEADER: 'x-auth-token',
  COOKIE_NAME: 'ocp_auth_token'
};

// Paramètres de limitation de taux de requêtes
export const RATE_LIMIT = {
  WINDOW_MS: 15 * 60 * 1000, // 15 minutes
  MAX_REQUESTS: 100,
  MESSAGE: 'Trop de requêtes depuis cette IP, veuillez réessayer après 15 minutes'
};

// Paramètres du serveur
export const SERVER = {
  PORT: process.env.PORT || 5000,
  CORS_ORIGIN: process.env.NODE_ENV === 'production' ? 'https://ocp-mining-app.com' : '*',
  CLIENT_URL: process.env.NODE_ENV === 'production' ? 'https://ocp-mining-app.com' : 'http://localhost:5000'
};

// Routes API
export const API_ROUTES = {
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    CHECK: '/api/auth/check',
    LOGOUT: '/api/auth/logout'
  },
  USERS: {
    BASE: '/api/users',
    BY_ID: '/api/users/:id'
  },
  MACHINES: {
    BASE: '/api/machines',
    BY_ID: '/api/machines/:id'
  },
  OPERATIONS: {
    BASE: '/api/operations',
    BY_ID: '/api/operations/:id',
    STATS: '/api/stats',
    PERFORMANCE: '/api/performance',
    PROGRESS: '/api/progress',
    VOLUME: '/api/volume'
  },
  SAFETY: {
    BASE: '/api/safety',
    BY_ID: '/api/safety/:id',
    STATS: '/api/safety/stats'
  }
};

// Messages d'erreur
export const ERROR_MESSAGES = {
  INTERNAL_SERVER_ERROR: 'Erreur interne du serveur',
  UNAUTHORIZED: 'Non autorisé',
  FORBIDDEN: 'Accès interdit',
  INVALID_CREDENTIALS: 'Nom d\'utilisateur ou mot de passe incorrect',
  USER_NOT_FOUND: 'Utilisateur non trouvé',
  MACHINE_NOT_FOUND: 'Machine non trouvée',
  OPERATION_NOT_FOUND: 'Opération non trouvée',
  SAFETY_INCIDENT_NOT_FOUND: 'Incident de sécurité non trouvé',
  INVALID_TOKEN: 'Token invalide ou expiré',
  MISSING_TOKEN: 'Token d\'authentification manquant',
  ADMIN_REQUIRED: 'Droits d\'administrateur requis pour cette action',
  VALIDATION_ERROR: 'Erreur de validation des données'
};