import { Request, Response } from 'express';
import { storage } from '../storage';
import { HTTP_STATUS, ERROR_MESSAGES } from '../config/constants';
import { insertUserSchema } from '@shared/schema';
import { ZodError } from 'zod';
import { formatZodError } from '../utils/validation.utils';
import { hashPassword } from '../utils/auth.utils';

/**
 * Récupère tous les utilisateurs
 * @param req Requête Express
 * @param res Réponse Express
 */
export async function getUsers(req: Request, res: Response) {
  try {
    const users = await storage.getUsers();
    
    // Masquer les mots de passe dans la réponse
    const sanitizedUsers = users.map(({ password, ...user }) => user);
    
    res.status(HTTP_STATUS.OK).json(sanitizedUsers);
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR
    });
  }
}

/**
 * Récupère un utilisateur par son ID
 * @param req Requête Express
 * @param res Réponse Express
 */
export async function getUserById(req: Request, res: Response) {
  try {
    const userId = parseInt(req.params.id);
    
    if (isNaN(userId)) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        error: 'ID d\'utilisateur invalide'
      });
    }
    
    const user = await storage.getUser(userId);
    
    if (!user) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        error: ERROR_MESSAGES.USER_NOT_FOUND
      });
    }
    
    // Masquer le mot de passe dans la réponse
    const { password, ...sanitizedUser } = user;
    
    res.status(HTTP_STATUS.OK).json(sanitizedUser);
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'utilisateur:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR
    });
  }
}

/**
 * Crée un nouvel utilisateur
 * @param req Requête Express
 * @param res Réponse Express
 */
export async function createUser(req: Request, res: Response) {
  try {
    // Valider les données avec Zod
    const userData = insertUserSchema.parse(req.body);
    
    // Vérifier si un utilisateur avec ce nom d'utilisateur existe déjà
    const existingUser = await storage.getUserByUsername(userData.username);
    if (existingUser) {
      return res.status(HTTP_STATUS.CONFLICT).json({
        error: 'Un utilisateur avec ce nom d\'utilisateur existe déjà'
      });
    }
    
    // S'assurer que le rôle est défini (valeur par défaut si non présent)
    if (!userData.role) {
      userData.role = 'utilisateur';
    }
    
    // Hacher le mot de passe
    userData.password = await hashPassword(userData.password);
    
    // Créer l'utilisateur
    const newUser = await storage.createUser(userData);
    
    // Masquer le mot de passe dans la réponse
    const { password, ...sanitizedUser } = newUser;
    
    res.status(HTTP_STATUS.CREATED).json(sanitizedUser);
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        error: 'Validation error',
        details: formatZodError(error)
      });
    }
    
    console.error('Erreur lors de la création de l\'utilisateur:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR
    });
  }
}

/**
 * Met à jour un utilisateur existant
 * @param req Requête Express
 * @param res Réponse Express
 */
export async function updateUser(req: Request, res: Response) {
  try {
    const userId = parseInt(req.params.id);
    
    if (isNaN(userId)) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        error: 'ID d\'utilisateur invalide'
      });
    }
    
    // Vérifier si l'utilisateur existe
    const existingUser = await storage.getUser(userId);
    if (!existingUser) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        error: ERROR_MESSAGES.USER_NOT_FOUND
      });
    }
    
    const updateData = { ...req.body };
    
    // Si le nom d'utilisateur est modifié, vérifier qu'il n'existe pas déjà
    if (updateData.username && updateData.username !== existingUser.username) {
      const userWithSameUsername = await storage.getUserByUsername(updateData.username);
      if (userWithSameUsername) {
        return res.status(HTTP_STATUS.CONFLICT).json({
          error: 'Un utilisateur avec ce nom d\'utilisateur existe déjà'
        });
      }
    }
    
    // Si le mot de passe est fourni, le hacher
    if (updateData.password) {
      updateData.password = await hashPassword(updateData.password);
    }
    
    // Mettre à jour l'utilisateur
    const updatedUser = await storage.updateUser(userId, updateData);
    
    if (!updatedUser) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        error: ERROR_MESSAGES.USER_NOT_FOUND
      });
    }
    
    // Masquer le mot de passe dans la réponse
    const { password, ...sanitizedUser } = updatedUser;
    
    res.status(HTTP_STATUS.OK).json(sanitizedUser);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'utilisateur:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR
    });
  }
}

/**
 * Supprime un utilisateur
 * @param req Requête Express
 * @param res Réponse Express
 */
export async function deleteUser(req: Request, res: Response) {
  try {
    const userId = parseInt(req.params.id);
    
    if (isNaN(userId)) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        error: 'ID d\'utilisateur invalide'
      });
    }
    
    // Empêcher la suppression de l'utilisateur admin principal (ID 1)
    if (userId === 1) {
      return res.status(HTTP_STATUS.FORBIDDEN).json({
        error: 'Impossible de supprimer l\'administrateur principal'
      });
    }
    
    // Vérifier si l'utilisateur existe
    const existingUser = await storage.getUser(userId);
    if (!existingUser) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        error: ERROR_MESSAGES.USER_NOT_FOUND
      });
    }
    
    // Vérifier si l'utilisateur qui fait la demande n'essaie pas de se supprimer lui-même
    if (req.user && req.user.id === userId) {
      return res.status(HTTP_STATUS.FORBIDDEN).json({
        error: 'Vous ne pouvez pas supprimer votre propre compte'
      });
    }
    
    // Supprimer l'utilisateur
    const deleted = await storage.deleteUser(userId);
    
    if (!deleted) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        error: ERROR_MESSAGES.USER_NOT_FOUND
      });
    }
    
    res.status(HTTP_STATUS.OK).json({
      message: 'Utilisateur supprimé avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'utilisateur:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR
    });
  }
}