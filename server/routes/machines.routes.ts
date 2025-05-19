import { Router } from 'express';
import { 
  getMachines, 
  getMachineById, 
  createMachine, 
  updateMachine, 
  deleteMachine 
} from '../controllers/machines.controller';
import { authenticate, authorizeSupervisor } from '../middlewares/auth.middleware';

const router = Router();

/**
 * @route GET /api/machines
 * @desc Récupérer toutes les machines
 * @access Private
 */
router.get('/', authenticate, getMachines);

/**
 * @route GET /api/machines/:id
 * @desc Récupérer une machine par son ID
 * @access Private
 */
router.get('/:id', authenticate, getMachineById);

/**
 * @route POST /api/machines
 * @desc Créer une nouvelle machine
 * @access Private (supervisor+)
 */
router.post('/', authenticate, authorizeSupervisor, createMachine);

/**
 * @route PUT /api/machines/:id
 * @desc Mettre à jour une machine
 * @access Private (supervisor+)
 */
router.put('/:id', authenticate, authorizeSupervisor, updateMachine);

/**
 * @route DELETE /api/machines/:id
 * @desc Supprimer une machine
 * @access Private (supervisor+)
 */
router.delete('/:id', authenticate, authorizeSupervisor, deleteMachine);

export default router;