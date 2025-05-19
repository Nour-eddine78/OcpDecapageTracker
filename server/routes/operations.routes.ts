import { Router } from 'express';
import { 
  getOperations, 
  getOperationById, 
  createOperation, 
  updateOperation, 
  deleteOperation 
} from '../controllers/operations.controller';
import { authenticate, authorizeSupervisor } from '../middlewares/auth.middleware';

const router = Router();

/**
 * @route GET /api/operations
 * @desc Récupérer toutes les opérations
 * @access Private
 */
router.get('/', authenticate, getOperations);

/**
 * @route GET /api/operations/:id
 * @desc Récupérer une opération par son ID
 * @access Private
 */
router.get('/:id', authenticate, getOperationById);

/**
 * @route POST /api/operations
 * @desc Créer une nouvelle opération
 * @access Private
 */
router.post('/', authenticate, createOperation);

/**
 * @route PUT /api/operations/:id
 * @desc Mettre à jour une opération
 * @access Private (supervisor+)
 */
router.put('/:id', authenticate, authorizeSupervisor, updateOperation);

/**
 * @route DELETE /api/operations/:id
 * @desc Supprimer une opération
 * @access Private (supervisor+)
 */
router.delete('/:id', authenticate, authorizeSupervisor, deleteOperation);

export default router;