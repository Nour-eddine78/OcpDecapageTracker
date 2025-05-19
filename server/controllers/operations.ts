import { Request, Response } from 'express';
import { db } from '../db';
import { operations, machines, safetyIncidents } from '../../shared/schema';
import { eq, and, gte } from 'drizzle-orm';
import { HTTP_STATUS } from '../config/constants';

export async function getOperations(req: Request, res: Response) {
  try {
    const allOperations = await db.select().from(operations);
    res.json(allOperations);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la récupération des opérations" });
  }
}

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

export async function getPerformanceStats(req: Request, res: Response) {
  try {
    const { timeRange, methodFilter } = req.query;
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - getDaysFromRange(timeRange as string));

    const query = db.select({
      date: operations.date,
      rendement: operations.rendement,
      disponibilite: operations.disponibilite,
      volume: operations.volumeSaute,
      metrage: operations.metrage
    })
    .from(operations)
    .where(
      and(
        gte(operations.date, daysAgo),
        methodFilter !== 'all' ? eq(operations.methode, methodFilter as string) : undefined
      )
    )
    .orderBy(operations.date);

    const stats = await query;
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la récupération des statistiques" });
  }
}

export async function getVolumeStats(req: Request, res: Response) {
  try {
    const { timeRange, methodFilter } = req.query;
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - getDaysFromRange(timeRange as string));

    const stats = await db.select({
      date: operations.date,
      volume: operations.volumeSaute,
      metrage: operations.metrage
    })
    .from(operations)
    .where(
      and(
        gte(operations.date, daysAgo),
        methodFilter !== 'all' ? eq(operations.methode, methodFilter as string) : undefined
      )
    )
    .orderBy(operations.date);

    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la récupération des statistiques de volume" });
  }
}

export async function getStats(req: Request, res: Response) {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [machines, operations, incidents] = await Promise.all([
      db.select().from(machines),
      db.select().from(operations).where(gte(operations.date, thirtyDaysAgo)),
      db.select().from(safetyIncidents).where(gte(safetyIncidents.date, thirtyDaysAgo))
    ]);

    const activeMachines = machines.filter(m => m.status === 'En service').length;
    const totalVolume = operations.reduce((sum, op) => sum + (op.volumeSaute || 0), 0);
    const avgPerformance = operations.length > 0
      ? Math.round(operations.reduce((sum, op) => sum + (op.rendement || 0), 0) / operations.length)
      : 0;

    res.json({
      activeMachines,
      totalVolume,
      avgPerformance: `${avgPerformance}%`,
      recentIncidents: incidents.length
    });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la récupération des statistiques générales" });
  }
}

function getDaysFromRange(timeRange: string = 'month'): number {
  switch (timeRange) {
    case 'week': return 7;
    case 'month': return 30;
    case 'quarter': return 90;
    case 'year': return 365;
    default: return 30;
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
      case 'week': return 7;
      case 'month': return 30;
      case 'quarter': return 90;
      case 'year': return 365;
      default: return 30;
    }
  }