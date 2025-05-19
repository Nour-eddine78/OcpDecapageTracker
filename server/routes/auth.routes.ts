import { Router } from 'express';
import { login, register, checkAuth, logout } from '../controllers/auth.controller';
import { authenticate, authorizeAdmin } from '../middlewares/auth.middleware';

const router = Router();

/**
 * @route POST /api/auth/login
 * @desc Connexion d'un utilisateur
 * @access Public
 */
router.post('/login', login);

/**
 * @route POST /api/auth/register
 * @desc Enregistrement d'un nouvel utilisateur (admin)
 * @access Private (admin)
 */
router.post('/register', authenticate, authorizeAdmin, register);

/**
 * @route GET /api/auth/check
 * @desc Vérification de l'authentification
 * @access Public
 */
router.get('/check', checkAuth);

/**
 * @route POST /api/auth/logout
 * @desc Déconnexion d'un utilisateur
 * @access Public
 */
router.post('/logout', logout);

export default router;