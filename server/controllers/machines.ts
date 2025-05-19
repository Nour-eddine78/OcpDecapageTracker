import { Request, Response } from 'express';
import { storage } from '../storage';
import { insertMachineSchema } from '@shared/schema';

// Get all machines with optional filtering
export async function getMachines(req: Request, res: Response) {
  try {
    const methode = req.query.methode as string | undefined;
    
    const machines = await storage.getMachines({ methode });
    
    res.json(machines);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
}

// Get machine by ID
export async function getMachineById(req: Request, res: Response) {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'ID de machine invalide' });
    }
    
    const machine = await storage.getMachine(id);
    if (!machine) {
      return res.status(404).json({ message: 'Machine non trouvée' });
    }
    
    res.json(machine);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
}

// Create machine
export async function createMachine(req: Request, res: Response) {
  try {
    // Validate request body
    const validationResult = insertMachineSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ message: 'Données invalides', errors: validationResult.error });
    }
    
    const { machineId, name, type, capacity, methode, status, specifications } = validationResult.data;
    
    // Check if machineId already exists
    const existingMachine = await storage.getMachineByMachineId(machineId);
    if (existingMachine) {
      return res.status(400).json({ message: 'ID de machine déjà utilisé' });
    }
    
    // Create new machine
    const machine = await storage.createMachine({
      machineId,
      name,
      type,
      capacity,
      methode,
      status: status || 'En service',
      specifications: specifications || {}
    });
    
    res.status(201).json(machine);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
}

// Update machine
export async function updateMachine(req: Request, res: Response) {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'ID de machine invalide' });
    }
    
    const machine = await storage.getMachine(id);
    if (!machine) {
      return res.status(404).json({ message: 'Machine non trouvée' });
    }
    
    // Validate and filter input data
    const { machineId, name, type, capacity, methode, status, specifications } = req.body;
    
    const updateData: any = {};
    if (machineId !== undefined) updateData.machineId = machineId;
    if (name !== undefined) updateData.name = name;
    if (type !== undefined) updateData.type = type;
    if (capacity !== undefined) updateData.capacity = capacity;
    if (methode !== undefined) updateData.methode = methode;
    if (status !== undefined) updateData.status = status;
    if (specifications !== undefined) updateData.specifications = specifications;
    
    // Check if machineId already exists
    if (machineId && machineId !== machine.machineId) {
      const existingMachine = await storage.getMachineByMachineId(machineId);
      if (existingMachine) {
        return res.status(400).json({ message: 'ID de machine déjà utilisé' });
      }
    }
    
    // Update machine
    const updatedMachine = await storage.updateMachine(id, updateData);
    
    res.json(updatedMachine);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
}

// Delete machine
export async function deleteMachine(req: Request, res: Response) {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'ID de machine invalide' });
    }
    
    const machine = await storage.getMachine(id);
    if (!machine) {
      return res.status(404).json({ message: 'Machine non trouvée' });
    }
    
    await storage.deleteMachine(id);
    
    res.json({ message: 'Machine supprimée avec succès' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
}
