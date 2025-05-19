import { Request, Response } from 'express';
import { storage } from '../storage';
import { insertUserSchema } from '@shared/schema';
import { hashPassword, comparePassword, generateToken } from '../auth';
import { HTTP_STATUS, ERROR_MESSAGES } from '../config/constants';

// Login user
export async function login(req: Request, res: Response) {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({ 
        message: ERROR_MESSAGES.MISSING_CREDENTIALS 
      });
    }

    const user = await storage.getUserByUsername(username);
    if (!user) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({ 
        message: ERROR_MESSAGES.INVALID_CREDENTIALS 
      });
    }

    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({ 
        message: ERROR_MESSAGES.INVALID_CREDENTIALS 
      });
    }

    await storage.updateUser(user.id, { lastLogin: new Date() });

    const token = generateToken(user);

    res.json({
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role
      },
      token
    });
  } catch (error) {
    console.error(error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ 
      message: ERROR_MESSAGES.INTERNAL_SERVER_ERROR 
    });
  }
}

// Register new user
export async function register(req: Request, res: Response) {
  try {
    // Validate request body
    const validationResult = insertUserSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ message: 'Données invalides', errors: validationResult.error });
    }
    
    const { username, password, name, role } = validationResult.data;
    
    // Check if username already exists
    const existingUser = await storage.getUserByUsername(username);
    if (existingUser) {
      return res.status(400).json({ message: 'Nom d\'utilisateur déjà utilisé' });
    }
    
    // Create new user
    // In production, you'd hash the password before saving
    const user = await storage.createUser({
      username,
      password,
      name,
      role: role || 'supervisor'
    });
    
    res.status(201).json({
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
}

// Check auth status
export async function checkAuth(req: Request, res: Response) {
  try {
    const user = (req as any).user;
    
    res.json({
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
}

// Get all users
export async function getUsers(req: Request, res: Response) {
  try {
    const users = await storage.getUsers();
    
    // Remove sensitive information like passwords
    const safeUsers = users.map(user => ({
      id: user.id,
      username: user.username,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin
    }));
    
    res.json(safeUsers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
}

// Get user by ID
export async function getUserById(req: Request, res: Response) {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'ID d\'utilisateur invalide' });
    }
    
    const user = await storage.getUser(id);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    
    // Only allow users to access their own data or admins to access any data
    const requestUser = (req as any).user;
    if (requestUser.id !== user.id && requestUser.role !== 'admin') {
      return res.status(403).json({ message: 'Accès non autorisé' });
    }
    
    res.json({
      id: user.id,
      username: user.username,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
}

// Create user
export async function createUser(req: Request, res: Response) {
  try {
    // Validate request body
    const validationResult = insertUserSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ message: 'Données invalides', errors: validationResult.error });
    }
    
    const { username, password, name, role } = validationResult.data;
    
    // Check if username already exists
    const existingUser = await storage.getUserByUsername(username);
    if (existingUser) {
      return res.status(400).json({ message: 'Nom d\'utilisateur déjà utilisé' });
    }
    
    // Create new user
    const user = await storage.createUser({
      username,
      password,
      name,
      role: role || 'supervisor'
    });
    
    res.status(201).json({
      id: user.id,
      username: user.username,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
}

// Update user
export async function updateUser(req: Request, res: Response) {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'ID d\'utilisateur invalide' });
    }
    
    const user = await storage.getUser(id);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    
    // Validate and filter input data
    const { username, password, name, role } = req.body;
    
    const updateData: any = {};
    if (username !== undefined) updateData.username = username;
    if (password !== undefined) updateData.password = password;
    if (name !== undefined) updateData.name = name;
    if (role !== undefined) updateData.role = role;
    
    // Check if username already exists
    if (username && username !== user.username) {
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ message: 'Nom d\'utilisateur déjà utilisé' });
      }
    }
    
    // Update user
    const updatedUser = await storage.updateUser(id, updateData);
    
    res.json({
      id: updatedUser!.id,
      username: updatedUser!.username,
      name: updatedUser!.name,
      role: updatedUser!.role,
      createdAt: updatedUser!.createdAt,
      lastLogin: updatedUser!.lastLogin
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
}

// Delete user
export async function deleteUser(req: Request, res: Response) {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'ID d\'utilisateur invalide' });
    }
    
    const user = await storage.getUser(id);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    
    // Prevent deletion of the last admin
    if (user.role === 'admin') {
      const users = await storage.getUsers();
      const adminCount = users.filter(u => u.role === 'admin').length;
      
      if (adminCount <= 1) {
        return res.status(400).json({ message: 'Impossible de supprimer le dernier administrateur' });
      }
    }
    
    await storage.deleteUser(id);
    
    res.json({ message: 'Utilisateur supprimé avec succès' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
}