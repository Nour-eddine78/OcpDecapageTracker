import { Request, Response } from 'express';
import { storage } from '../storage';
import { hashPassword } from '../utils/auth.utils';
import { HTTP_STATUS, ERROR_MESSAGES } from '../config/constants';
import { insertUserSchema } from '@shared/schema';
import { ZodError } from 'zod';
import { formatZodError } from '../utils/validation.utils';

/**
 * Récupère tous les utilisateurs
 * @param req Requête Express
 * @param res Réponse Express
 */
export async function getUsers(req: Request, res: Response) {
  try {
    const users = await storage.getUsers();
    
    // Ne pas renvoyer les mots de passe
    const sanitizedUsers = users.map(user => ({
      id: user.id,
      username: user.username,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin
    }));
    
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
    
    // Ne pas renvoyer le mot de passe
    const sanitizedUser = {
      id: user.id,
      username: user.username,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin
    };
    
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
        error: ERROR_MESSAGES.USER_ALREADY_EXISTS
      });
    }
    
    // Hacher le mot de passe
    const hashedPassword = await hashPassword(userData.password);
    
    // Créer l'utilisateur
    const newUser = await storage.createUser({
      ...userData,
      password: hashedPassword
    });
    
    // Ne pas renvoyer le mot de passe
    const sanitizedUser = {
      id: newUser.id,
      username: newUser.username,
      name: newUser.name,
      role: newUser.role,
      createdAt: newUser.createdAt
    };
    
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
    
    // Préparer les données à mettre à jour
    const updateData: any = { ...req.body };
    
    // Hacher le mot de passe si présent
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
    
    // Ne pas renvoyer le mot de passe
    const sanitizedUser = {
      id: updatedUser.id,
      username: updatedUser.username,
      name: updatedUser.name,
      role: updatedUser.role,
      createdAt: updatedUser.createdAt,
      lastLogin: updatedUser.lastLogin
    };
    
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
    
    // Vérifier si l'utilisateur existe
    const existingUser = await storage.getUser(userId);
    if (!existingUser) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        error: ERROR_MESSAGES.USER_NOT_FOUND
      });
    }
    
    // Protéger les utilisateurs administrateurs (empêcher la suppression du dernier admin)
    if (existingUser.role === 'admin') {
      const users = await storage.getUsers();
      const adminUsers = users.filter(user => user.role === 'admin');
      
      if (adminUsers.length <= 1) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          error: 'Impossible de supprimer le dernier administrateur'
        });
      }
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