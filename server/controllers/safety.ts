import { Request, Response } from 'express';
import { storage } from '../storage';
import { insertSafetyIncidentSchema } from '@shared/schema';

// Get all safety incidents with optional filtering
export async function getSafetyIncidents(req: Request, res: Response) {
  try {
    const type = req.query.type as string | undefined;
    const severity = req.query.severity as string | undefined;
    const status = req.query.status as string | undefined;
    
    const incidents = await storage.getSafetyIncidents({ type, severity, status });
    
    res.json(incidents);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
}

// Get safety incident by ID
export async function getSafetyIncidentById(req: Request, res: Response) {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'ID d\'incident invalide' });
    }
    
    const incident = await storage.getSafetyIncident(id);
    if (!incident) {
      return res.status(404).json({ message: 'Incident non trouvé' });
    }
    
    res.json(incident);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
}

// Create safety incident
export async function createSafetyIncident(req: Request, res: Response) {
  try {
    // Get current user from request
    const user = (req as any).user;
    
    // Validate request body
    const validationResult = insertSafetyIncidentSchema.safeParse({
      ...req.body,
      reportedBy: user.id
    });
    
    if (!validationResult.success) {
      return res.status(400).json({ message: 'Données invalides', errors: validationResult.error });
    }
    
    // Generate incident ID if not provided
    if (!validationResult.data.incidentId) {
      validationResult.data.incidentId = `INC-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000)}`;
    }
    
    // Create new incident
    const incident = await storage.createSafetyIncident(validationResult.data);
    
    res.status(201).json(incident);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
}

// Update safety incident
export async function updateSafetyIncident(req: Request, res: Response) {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'ID d\'incident invalide' });
    }
    
    const incident = await storage.getSafetyIncident(id);
    if (!incident) {
      return res.status(404).json({ message: 'Incident non trouvé' });
    }
    
    // Get current user from request
    const user = (req as any).user;
    
    // If incident is being resolved, set the resolver
    if (req.body.status === 'Résolu' && incident.status !== 'Résolu') {
      req.body.resolvedBy = user.id;
      req.body.resolvedAt = new Date();
    }
    
    // Update incident
    const updatedIncident = await storage.updateSafetyIncident(id, req.body);
    
    res.json(updatedIncident);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
}

// Delete safety incident
export async function deleteSafetyIncident(req: Request, res: Response) {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'ID d\'incident invalide' });
    }
    
    const incident = await storage.getSafetyIncident(id);
    if (!incident) {
      return res.status(404).json({ message: 'Incident non trouvé' });
    }
    
    await storage.deleteSafetyIncident(id);
    
    res.json({ message: 'Incident supprimé avec succès' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
}
