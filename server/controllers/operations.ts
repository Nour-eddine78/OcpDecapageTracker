import { Request, Response } from 'express';
import { db } from '../db';
import { operations } from '@/shared/schema';
import { eq } from 'drizzle-orm';
import { HTTP_STATUS } from '../config/constants';

// Get all operations with optional filtering
export async function getOperations(req: Request, res: Response) {
  try {
    const allOperations = await db.select().from(operations);
    res.status(HTTP_STATUS.OK).json(allOperations);
  } catch (error) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: "Erreur lors de la récupération des opérations" });
  }
}

// Get operation by ID
export async function getOperationById(req: Request, res: Response) {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'ID d\'opération invalide' });
    }
    
    const operation = await db.select().from(operations).where(eq(operations.id, id));
    if (!operation || operation.length === 0) {
      return res.status(404).json({ message: 'Opération non trouvée' });
    }
    
    res.json(operation[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
}

// Create operation
export async function createOperation(req: Request, res: Response) {
  try {
    const newOperation = await db.insert(operations).values(req.body).returning();
    res.status(HTTP_STATUS.CREATED).json(newOperation[0]);
  } catch (error) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: "Erreur lors de la création de l'opération" });
  }
}

// Update operation
export async function updateOperation(req: Request, res: Response) {
  try {
    const updatedOperation = await db.update(operations)
      .set(req.body)
      .where(eq(operations.id, parseInt(req.params.id)))
      .returning();
    res.status(HTTP_STATUS.OK).json(updatedOperation[0]);
  } catch (error) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: "Erreur lors de la mise à jour de l'opération" });
  }
}

// Delete operation
export async function deleteOperation(req: Request, res: Response) {
  try {
    await db.delete(operations).where(eq(operations.id, parseInt(req.params.id)));
    res.status(HTTP_STATUS.NO_CONTENT).send();
  } catch (error) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: "Erreur lors de la suppression de l'opération" });
  }
}

// Get general statistics
export async function getStats(req: Request, res: Response) {
  try {
    const machines = []; //await storage.getMachines();
    const operationsList = await db.select().from(operations); //await storage.getOperations();
    const safetyIncidents = []; //await storage.getSafetyIncidents();
    
    // Calculate statistics
    const activeMachines = machines.filter(machine => machine.status === 'En service').length;
    
    const totalVolume = operationsList.reduce((sum, op) => sum + (op.volumeSaute || 0), 0);
    
    // Calculate average performance (rendement)
    const operationsWithRendement = operationsList.filter(op => op.rendement !== undefined && op.rendement !== null);
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