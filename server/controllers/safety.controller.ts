import { Request, Response } from 'express';
import { storage } from '../storage';
import { HTTP_STATUS, ERROR_MESSAGES } from '../config/constants';
import { insertSafetyIncidentSchema } from '@shared/schema';
import { ZodError } from 'zod';
import { formatZodError } from '../utils/validation.utils';
import { generateObjectId } from '../utils/auth.utils';

/**
 * Récupère tous les incidents de sécurité avec filtrage optionnel
 * @param req Requête Express
 * @param res Réponse Express
 */
export async function getSafetyIncidents(req: Request, res: Response) {
  try {
    // Récupérer les paramètres de filtrage optionnels
    const type = req.query.type as string | undefined;
    const severity = req.query.severity as string | undefined;
    const status = req.query.status as string | undefined;
    
    // Appliquer les filtres s'ils sont présents
    const filter: { type?: string, severity?: string, status?: string } = {};
    if (type) {
      filter.type = type;
    }
    if (severity) {
      filter.severity = severity;
    }
    if (status) {
      filter.status = status;
    }
    
    const incidents = await storage.getSafetyIncidents(filter);
    res.status(HTTP_STATUS.OK).json(incidents);
  } catch (error) {
    console.error('Erreur lors de la récupération des incidents de sécurité:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR
    });
  }
}

/**
 * Récupère un incident de sécurité par son ID
 * @param req Requête Express
 * @param res Réponse Express
 */
export async function getSafetyIncidentById(req: Request, res: Response) {
  try {
    const incidentId = parseInt(req.params.id);
    
    if (isNaN(incidentId)) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        error: 'ID d\'incident invalide'
      });
    }
    
    const incident = await storage.getSafetyIncident(incidentId);
    
    if (!incident) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        error: ERROR_MESSAGES.SAFETY_INCIDENT_NOT_FOUND
      });
    }
    
    res.status(HTTP_STATUS.OK).json(incident);
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'incident de sécurité:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR
    });
  }
}

/**
 * Crée un nouvel incident de sécurité
 * @param req Requête Express
 * @param res Réponse Express
 */
export async function createSafetyIncident(req: Request, res: Response) {
  try {
    // Valider les données avec Zod
    const incidentData = insertSafetyIncidentSchema.parse(req.body);
    
    // Vérifier si un incident avec cet ID existe déjà
    if (incidentData.incidentId) {
      const existingIncident = await storage.getSafetyIncidentByIncidentId(incidentData.incidentId);
      if (existingIncident) {
        return res.status(HTTP_STATUS.CONFLICT).json({
          error: 'Un incident avec cet identifiant existe déjà'
        });
      }
    } else {
      // Générer un nouvel ID d'incident s'il n'est pas fourni
      incidentData.incidentId = generateObjectId('INC');
    }
    
    // S'assurer que le statut est défini (valeur par défaut si non présent)
    if (!incidentData.status) {
      incidentData.status = 'Ouvert';
    }
    
    // Créer l'incident
    const newIncident = await storage.createSafetyIncident(incidentData);
    
    res.status(HTTP_STATUS.CREATED).json(newIncident);
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        error: 'Validation error',
        details: formatZodError(error)
      });
    }
    
    console.error('Erreur lors de la création de l\'incident de sécurité:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR
    });
  }
}

/**
 * Met à jour un incident de sécurité existant
 * @param req Requête Express
 * @param res Réponse Express
 */
export async function updateSafetyIncident(req: Request, res: Response) {
  try {
    const incidentId = parseInt(req.params.id);
    
    if (isNaN(incidentId)) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        error: 'ID d\'incident invalide'
      });
    }
    
    // Vérifier si l'incident existe
    const existingIncident = await storage.getSafetyIncident(incidentId);
    if (!existingIncident) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        error: ERROR_MESSAGES.SAFETY_INCIDENT_NOT_FOUND
      });
    }
    
    // Si l'ID d'incident est modifié, vérifier qu'il n'existe pas déjà
    if (req.body.incidentId && req.body.incidentId !== existingIncident.incidentId) {
      const incidentWithSameId = await storage.getSafetyIncidentByIncidentId(req.body.incidentId);
      if (incidentWithSameId && incidentWithSameId.id !== incidentId) {
        return res.status(HTTP_STATUS.CONFLICT).json({
          error: 'Un incident avec cet identifiant existe déjà'
        });
      }
    }
    
    // Gérer la résolution de l'incident
    const updateData = { ...req.body };
    if (updateData.status === 'Résolu' && existingIncident.status !== 'Résolu') {
      // Si l'incident est résolu pour la première fois, définir la date de résolution
      if (!updateData.resolvedAt) {
        updateData.resolvedAt = new Date();
      }
      
      // Si l'utilisateur de résolution n'est pas défini, définir l'utilisateur actuel s'il est disponible
      if (!updateData.resolvedBy && req.user) {
        updateData.resolvedBy = req.user.id;
      }
    }
    
    // Mettre à jour l'incident
    const updatedIncident = await storage.updateSafetyIncident(incidentId, updateData);
    
    if (!updatedIncident) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        error: ERROR_MESSAGES.SAFETY_INCIDENT_NOT_FOUND
      });
    }
    
    res.status(HTTP_STATUS.OK).json(updatedIncident);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'incident de sécurité:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR
    });
  }
}

/**
 * Supprime un incident de sécurité
 * @param req Requête Express
 * @param res Réponse Express
 */
export async function deleteSafetyIncident(req: Request, res: Response) {
  try {
    const incidentId = parseInt(req.params.id);
    
    if (isNaN(incidentId)) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        error: 'ID d\'incident invalide'
      });
    }
    
    // Vérifier si l'incident existe
    const existingIncident = await storage.getSafetyIncident(incidentId);
    if (!existingIncident) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        error: ERROR_MESSAGES.SAFETY_INCIDENT_NOT_FOUND
      });
    }
    
    // Supprimer l'incident
    const deleted = await storage.deleteSafetyIncident(incidentId);
    
    if (!deleted) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        error: ERROR_MESSAGES.SAFETY_INCIDENT_NOT_FOUND
      });
    }
    
    res.status(HTTP_STATUS.OK).json({
      message: 'Incident de sécurité supprimé avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'incident de sécurité:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR
    });
  }
}

/**
 * Récupère des statistiques sur les incidents de sécurité
 * @param req Requête Express
 * @param res Réponse Express
 */
export async function getSafetyStats(req: Request, res: Response) {
  try {
    // Récupérer tous les incidents de sécurité
    const incidents = await storage.getSafetyIncidents();
    
    // Calculer les statistiques
    const totalIncidents = incidents.length;
    const openIncidents = incidents.filter(inc => inc.status === 'Ouvert').length;
    const inProgressIncidents = incidents.filter(inc => inc.status === 'En cours').length;
    const resolvedIncidents = incidents.filter(inc => inc.status === 'Résolu').length;
    
    // Calculer les statistiques par type et sévérité
    const typeCount: Record<string, number> = {};
    const severityCount: Record<string, number> = {};
    
    incidents.forEach(inc => {
      // Comptage par type
      typeCount[inc.type] = (typeCount[inc.type] || 0) + 1;
      
      // Comptage par sévérité
      severityCount[inc.severity] = (severityCount[inc.severity] || 0) + 1;
    });
    
    // Récupérer les incidents récents
    const recentIncidents = [...incidents]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
    
    // Statistiques sur le délai de résolution
    const resolvedWithTime = incidents.filter(inc => inc.status === 'Résolu' && inc.resolvedAt && inc.createdAt);
    const avgResolutionTimeMs = resolvedWithTime.length > 0
      ? resolvedWithTime.reduce((sum, inc) => {
          const createdDate = new Date(inc.createdAt);
          const resolvedDate = new Date(inc.resolvedAt!);
          return sum + (resolvedDate.getTime() - createdDate.getTime());
        }, 0) / resolvedWithTime.length
      : 0;
    
    // Convertir en jours
    const avgResolutionTimeDays = avgResolutionTimeMs / (1000 * 60 * 60 * 24);
    
    res.status(HTTP_STATUS.OK).json({
      totalIncidents,
      openIncidents,
      inProgressIncidents,
      resolvedIncidents,
      typeSummary: typeCount,
      severitySummary: severityCount,
      avgResolutionTimeDays,
      recentIncidents
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques de sécurité:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR
    });
  }
}