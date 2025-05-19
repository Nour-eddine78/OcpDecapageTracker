import { Request, Response } from 'express';
import { storage } from '../storage';
import { insertOperationSchema } from '@shared/schema';

// Get all operations with optional filtering
export async function getOperations(req: Request, res: Response) {
  try {
    const methode = req.query.methode as string | undefined;
    const panneau = req.query.panneau as string | undefined;
    
    const operations = await storage.getOperations({ methode, panneau });
    
    res.json(operations);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
}

// Get operation by ID
export async function getOperationById(req: Request, res: Response) {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'ID d\'opération invalide' });
    }
    
    const operation = await storage.getOperation(id);
    if (!operation) {
      return res.status(404).json({ message: 'Opération non trouvée' });
    }
    
    res.json(operation);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
}

// Create operation
export async function createOperation(req: Request, res: Response) {
  try {
    // Get current user from request
    const user = (req as any).user;
    
    // Validate request body
    const validationResult = insertOperationSchema.safeParse({
      ...req.body,
      createdBy: user.id
    });
    
    if (!validationResult.success) {
      return res.status(400).json({ message: 'Données invalides', errors: validationResult.error });
    }
    
    // Generate operation ID if not provided
    if (!validationResult.data.operationId) {
      validationResult.data.operationId = `DCG-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000)}`;
    }
    
    // Create new operation
    const operation = await storage.createOperation(validationResult.data);
    
    res.status(201).json(operation);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
}

// Update operation
export async function updateOperation(req: Request, res: Response) {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'ID d\'opération invalide' });
    }
    
    const operation = await storage.getOperation(id);
    if (!operation) {
      return res.status(404).json({ message: 'Opération non trouvée' });
    }
    
    // Update operation
    const updatedOperation = await storage.updateOperation(id, req.body);
    
    res.json(updatedOperation);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
}

// Delete operation
export async function deleteOperation(req: Request, res: Response) {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'ID d\'opération invalide' });
    }
    
    const operation = await storage.getOperation(id);
    if (!operation) {
      return res.status(404).json({ message: 'Opération non trouvée' });
    }
    
    await storage.deleteOperation(id);
    
    res.json({ message: 'Opération supprimée avec succès' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
}

// Get general statistics
export async function getStats(req: Request, res: Response) {
  try {
    const machines = await storage.getMachines();
    const operations = await storage.getOperations();
    const safetyIncidents = await storage.getSafetyIncidents();
    
    // Calculate statistics
    const activeMachines = machines.filter(machine => machine.status === 'En service').length;
    
    const totalVolume = operations.reduce((sum, op) => sum + op.volumeSaute, 0);
    
    // Calculate average performance (rendement)
    const operationsWithRendement = operations.filter(op => op.rendement !== undefined && op.rendement !== null);
    const avgPerformance = operationsWithRendement.length > 0
      ? Math.round(operationsWithRendement.reduce((sum, op) => sum + (op.rendement || 0), 0) / operationsWithRendement.length)
      : 0;
    
    // Count incidents in the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentIncidents = safetyIncidents.filter(
      incident => new Date(incident.createdAt) >= thirtyDaysAgo
    ).length;
    
    res.json({
      activeMachines,
      volume: totalVolume,
      avgPerformance: `${avgPerformance}%`,
      incidents: recentIncidents
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
}

// Get performance statistics for charts
export async function getPerformanceStats(req: Request, res: Response) {
  try {
    const timeRange = req.query.timeRange as string || 'month';
    const methodFilter = req.query.methodFilter as string || 'all';
    
    // Generate sample data for charts
    // In a real app, this would query and aggregate real data
    const performanceData = generatePerformanceData(timeRange, methodFilter);
    
    res.json(performanceData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
}

// Get volume statistics for charts
export async function getVolumeStats(req: Request, res: Response) {
  try {
    const timeRange = req.query.timeRange as string || 'month';
    const methodFilter = req.query.methodFilter as string || 'all';
    
    // Generate sample data for charts
    // In a real app, this would query and aggregate real data
    const volumeData = generateVolumeData(timeRange, methodFilter);
    
    res.json(volumeData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
}

// Get progress statistics
export async function getProgressStats(req: Request, res: Response) {
  try {
    const site = req.query.site as string || 'all';
    
    // Generate sample data for progress charts
    // In a real app, this would query and aggregate real data
    const progressData = generateProgressData(site);
    
    res.json(progressData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
}

// Helper functions to generate sample data
function generatePerformanceData(timeRange: string, methodFilter: string) {
  const data = [];
  const days = getTimeRangeDays(timeRange);
  
  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(date.getDate() - (days - i - 1));
    const dateStr = date.toISOString().split('T')[0];
    
    data.push({
      date: dateStr,
      rendement: Math.floor(Math.random() * 20 + 20),
      disponibilite: Math.floor(Math.random() * 15 + 75),
      heures: Math.floor(Math.random() * 10 + 5)
    });
  }
  
  return data;
}

function generateVolumeData(timeRange: string, methodFilter: string) {
  const data = [];
  const days = getTimeRangeDays(timeRange);
  
  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(date.getDate() - (days - i - 1));
    const dateStr = date.toISOString().split('T')[0];
    
    data.push({
      date: dateStr,
      volume: Math.floor(Math.random() * 1000 + 500),
      metrage: Math.floor(Math.random() * 400 + 200)
    });
  }
  
  return data;
}

function generateProgressData(site: string) {
  const data = [];
  const days = 14; // Two weeks of data
  
  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(date.getDate() - (days - i - 1));
    const dateStr = date.toISOString().split('T')[0];
    
    const prevValue = i > 0 ? data[i-1].realise : 0;
    const increment = Math.floor(Math.random() * 500 + 300);
    
    data.push({
      date: dateStr,
      realise: prevValue + increment,
      prevu: Math.floor((prevValue + increment) * (Math.random() * 0.3 + 0.9)) // Slightly different from realised
    });
  }
  
  return data;
}

function getTimeRangeDays(timeRange: string): number {
  switch (timeRange) {
    case 'week':
      return 7;
    case 'month':
      return 30;
    case 'quarter':
      return 90;
    case 'year':
      return 365;
    default:
      return 30;
  }
}
