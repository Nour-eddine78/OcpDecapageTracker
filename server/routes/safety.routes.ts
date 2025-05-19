import { Router } from 'express';
import { 
  getSafetyIncidents, 
  getSafetyIncidentById, 
  createSafetyIncident, 
  updateSafetyIncident, 
  deleteSafetyIncident 
} from '../controllers/safety.controller';
import { authenticate, authorizeSupervisor } from '../middlewares/auth.middleware';

const router = Router();

/**
 * @route GET /api/safety
 * @desc Récupérer tous les incidents de sécurité
 * @access Private
 */
router.get('/', authenticate, getSafetyIncidents);

/**
 * @route GET /api/safety/:id
 * @desc Récupérer un incident de sécurité par son ID
 * @access Private
 */
router.get('/:id', authenticate, getSafetyIncidentById);

/**
 * @route POST /api/safety
 * @desc Créer un nouvel incident de sécurité
 * @access Private
 */
router.post('/', authenticate, createSafetyIncident);

/**
 * @route PUT /api/safety/:id
 * @desc Mettre à jour un incident de sécurité
 * @access Private (supervisor+)
 */
router.put('/:id', authenticate, authorizeSupervisor, updateSafetyIncident);

/**
 * @route DELETE /api/safety/:id
 * @desc Supprimer un incident de sécurité
 * @access Private (supervisor+)
 */
router.delete('/:id', authenticate, authorizeSupervisor, deleteSafetyIncident);

export default router;