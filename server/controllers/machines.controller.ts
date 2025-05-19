import { Request, Response } from 'express';
import { storage } from '../storage';
import { HTTP_STATUS, ERROR_MESSAGES } from '../config/constants';
import { insertMachineSchema } from '@shared/schema';
import { ZodError } from 'zod';
import { formatZodError } from '../utils/validation.utils';
import { generateObjectId } from '../utils/auth.utils';

/**
 * Récupère toutes les machines avec filtrage optionnel
 * @param req Requête Express
 * @param res Réponse Express
 */
export async function getMachines(req: Request, res: Response) {
  try {
    // Récupérer les paramètres de filtrage optionnels
    const methode = req.query.methode as string | undefined;
    
    // Appliquer les filtres s'ils sont présents
    const filter: { methode?: string } = {};
    if (methode) {
      filter.methode = methode;
    }
    
    const machines = await storage.getMachines(filter);
    res.status(HTTP_STATUS.OK).json(machines);
  } catch (error) {
    console.error('Erreur lors de la récupération des machines:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR
    });
  }
}

/**
 * Récupère une machine par son ID
 * @param req Requête Express
 * @param res Réponse Express
 */
export async function getMachineById(req: Request, res: Response) {
  try {
    const machineId = parseInt(req.params.id);
    
    if (isNaN(machineId)) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        error: 'ID de machine invalide'
      });
    }
    
    const machine = await storage.getMachine(machineId);
    
    if (!machine) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        error: ERROR_MESSAGES.MACHINE_NOT_FOUND
      });
    }
    
    res.status(HTTP_STATUS.OK).json(machine);
  } catch (error) {
    console.error('Erreur lors de la récupération de la machine:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR
    });
  }
}

/**
 * Crée une nouvelle machine
 * @param req Requête Express
 * @param res Réponse Express
 */
export async function createMachine(req: Request, res: Response) {
  try {
    // Valider les données avec Zod
    const machineData = insertMachineSchema.parse(req.body);
    
    // Vérifier si une machine avec cet ID existe déjà
    if (machineData.machineId) {
      const existingMachine = await storage.getMachineByMachineId(machineData.machineId);
      if (existingMachine) {
        return res.status(HTTP_STATUS.CONFLICT).json({
          error: 'Une machine avec cet identifiant existe déjà'
        });
      }
    } else {
      // Générer un nouvel ID de machine s'il n'est pas fourni
      machineData.machineId = generateObjectId('MCH');
    }
    
    // S'assurer que le statut est défini (valeur par défaut si non présent)
    if (!machineData.status) {
      machineData.status = 'disponible';
    }
    
    // Créer la machine
    const newMachine = await storage.createMachine(machineData);
    
    res.status(HTTP_STATUS.CREATED).json(newMachine);
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        error: 'Validation error',
        details: formatZodError(error)
      });
    }
    
    console.error('Erreur lors de la création de la machine:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR
    });
  }
}

/**
 * Met à jour une machine existante
 * @param req Requête Express
 * @param res Réponse Express
 */
export async function updateMachine(req: Request, res: Response) {
  try {
    const machineId = parseInt(req.params.id);
    
    if (isNaN(machineId)) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        error: 'ID de machine invalide'
      });
    }
    
    // Vérifier si la machine existe
    const existingMachine = await storage.getMachine(machineId);
    if (!existingMachine) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        error: ERROR_MESSAGES.MACHINE_NOT_FOUND
      });
    }
    
    // Si l'ID de machine est modifié, vérifier qu'il n'existe pas déjà
    if (req.body.machineId && req.body.machineId !== existingMachine.machineId) {
      const machineWithSameId = await storage.getMachineByMachineId(req.body.machineId);
      if (machineWithSameId && machineWithSameId.id !== machineId) {
        return res.status(HTTP_STATUS.CONFLICT).json({
          error: 'Une machine avec cet identifiant existe déjà'
        });
      }
    }
    
    // Mettre à jour la machine
    const updatedMachine = await storage.updateMachine(machineId, req.body);
    
    if (!updatedMachine) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        error: ERROR_MESSAGES.MACHINE_NOT_FOUND
      });
    }
    
    res.status(HTTP_STATUS.OK).json(updatedMachine);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la machine:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR
    });
  }
}

/**
 * Supprime une machine
 * @param req Requête Express
 * @param res Réponse Express
 */
export async function deleteMachine(req: Request, res: Response) {
  try {
    const machineId = parseInt(req.params.id);
    
    if (isNaN(machineId)) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        error: 'ID de machine invalide'
      });
    }
    
    // Vérifier si la machine existe
    const existingMachine = await storage.getMachine(machineId);
    if (!existingMachine) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        error: ERROR_MESSAGES.MACHINE_NOT_FOUND
      });
    }
    
    // Supprimer la machine
    const deleted = await storage.deleteMachine(machineId);
    
    if (!deleted) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        error: ERROR_MESSAGES.MACHINE_NOT_FOUND
      });
    }
    
    res.status(HTTP_STATUS.OK).json({
      message: 'Machine supprimée avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la suppression de la machine:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR
    });
  }
}