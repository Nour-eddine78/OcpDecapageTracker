import { Request, Response } from 'express';
import { storage } from '../storage';
import { HTTP_STATUS, ERROR_MESSAGES } from '../config/constants';
import { insertOperationSchema } from '@shared/schema';
import { ZodError } from 'zod';
import { formatZodError } from '../utils/validation.utils';
import { generateObjectId } from '../utils/auth.utils';

/**
 * Récupère toutes les opérations avec filtrage optionnel
 * @param req Requête Express
 * @param res Réponse Express
 */
export async function getOperations(req: Request, res: Response) {
  try {
    // Récupérer les paramètres de filtrage optionnels
    const methode = req.query.methode as string | undefined;
    const panneau = req.query.panneau as string | undefined;
    
    // Appliquer les filtres s'ils sont présents
    const filter: { methode?: string, panneau?: string } = {};
    if (methode) {
      filter.methode = methode;
    }
    if (panneau) {
      filter.panneau = panneau;
    }
    
    const operations = await storage.getOperations(filter);
    res.status(HTTP_STATUS.OK).json(operations);
  } catch (error) {
    console.error('Erreur lors de la récupération des opérations:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR
    });
  }
}

/**
 * Récupère une opération par son ID
 * @param req Requête Express
 * @param res Réponse Express
 */
export async function getOperationById(req: Request, res: Response) {
  try {
    const operationId = parseInt(req.params.id);
    
    if (isNaN(operationId)) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        error: 'ID d\'opération invalide'
      });
    }
    
    const operation = await storage.getOperation(operationId);
    
    if (!operation) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        error: ERROR_MESSAGES.OPERATION_NOT_FOUND
      });
    }
    
    res.status(HTTP_STATUS.OK).json(operation);
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'opération:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR
    });
  }
}

/**
 * Crée une nouvelle opération
 * @param req Requête Express
 * @param res Réponse Express
 */
export async function createOperation(req: Request, res: Response) {
  try {
    // Valider les données avec Zod
    const operationData = insertOperationSchema.parse(req.body);
    
    // Vérifier si une opération avec cet ID existe déjà
    if (operationData.operationId) {
      const existingOperation = await storage.getOperationByOperationId(operationData.operationId);
      if (existingOperation) {
        return res.status(HTTP_STATUS.CONFLICT).json({
          error: 'Une opération avec cet identifiant existe déjà'
        });
      }
    } else {
      // Générer un nouvel ID d'opération s'il n'est pas fourni
      operationData.operationId = generateObjectId('OP');
    }
    
    // Effectuer des calculs automatiques basés sur les données fournies
    if (operationData.heuresMarche !== undefined && operationData.dureeArret !== undefined) {
      // Calculer la disponibilité
      const totalHeures = operationData.heuresMarche + operationData.dureeArret;
      if (totalHeures > 0) {
        operationData.disponibilite = +(operationData.heuresMarche / totalHeures * 100).toFixed(2);
      } else {
        operationData.disponibilite = 0;
      }
      
      // Calculer le rendement si le métrage est disponible
      if (operationData.metrage !== undefined && operationData.heuresMarche > 0) {
        operationData.rendement = +(operationData.metrage / operationData.heuresMarche).toFixed(2);
      } else {
        operationData.rendement = 0;
      }
    }
    
    // Créer l'opération
    const newOperation = await storage.createOperation(operationData);
    
    res.status(HTTP_STATUS.CREATED).json(newOperation);
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        error: 'Validation error',
        details: formatZodError(error)
      });
    }
    
    console.error('Erreur lors de la création de l\'opération:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR
    });
  }
}

/**
 * Met à jour une opération existante
 * @param req Requête Express
 * @param res Réponse Express
 */
export async function updateOperation(req: Request, res: Response) {
  try {
    const operationId = parseInt(req.params.id);
    
    if (isNaN(operationId)) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        error: 'ID d\'opération invalide'
      });
    }
    
    // Vérifier si l'opération existe
    const existingOperation = await storage.getOperation(operationId);
    if (!existingOperation) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        error: ERROR_MESSAGES.OPERATION_NOT_FOUND
      });
    }
    
    // Si l'ID d'opération est modifié, vérifier qu'il n'existe pas déjà
    if (req.body.operationId && req.body.operationId !== existingOperation.operationId) {
      const operationWithSameId = await storage.getOperationByOperationId(req.body.operationId);
      if (operationWithSameId && operationWithSameId.id !== operationId) {
        return res.status(HTTP_STATUS.CONFLICT).json({
          error: 'Une opération avec cet identifiant existe déjà'
        });
      }
    }
    
    // Préparer les données à mettre à jour
    const updateData = { ...req.body };
    
    // Recalculer les métriques si les heures/métrage sont modifiés
    const heuresMarche = updateData.heuresMarche !== undefined ? updateData.heuresMarche : existingOperation.heuresMarche;
    const dureeArret = updateData.dureeArret !== undefined ? updateData.dureeArret : existingOperation.dureeArret;
    const metrage = updateData.metrage !== undefined ? updateData.metrage : existingOperation.metrage;
    
    // Calculer la disponibilité
    const totalHeures = heuresMarche + dureeArret;
    if (totalHeures > 0) {
      updateData.disponibilite = +(heuresMarche / totalHeures * 100).toFixed(2);
    } else {
      updateData.disponibilite = 0;
    }
    
    // Calculer le rendement
    if (heuresMarche > 0) {
      updateData.rendement = +(metrage / heuresMarche).toFixed(2);
    } else {
      updateData.rendement = 0;
    }
    
    // Mettre à jour l'opération
    const updatedOperation = await storage.updateOperation(operationId, updateData);
    
    if (!updatedOperation) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        error: ERROR_MESSAGES.OPERATION_NOT_FOUND
      });
    }
    
    res.status(HTTP_STATUS.OK).json(updatedOperation);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'opération:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR
    });
  }
}

/**
 * Supprime une opération
 * @param req Requête Express
 * @param res Réponse Express
 */
export async function deleteOperation(req: Request, res: Response) {
  try {
    const operationId = parseInt(req.params.id);
    
    if (isNaN(operationId)) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        error: 'ID d\'opération invalide'
      });
    }
    
    // Vérifier si l'opération existe
    const existingOperation = await storage.getOperation(operationId);
    if (!existingOperation) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        error: ERROR_MESSAGES.OPERATION_NOT_FOUND
      });
    }
    
    // Supprimer l'opération
    const deleted = await storage.deleteOperation(operationId);
    
    if (!deleted) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        error: ERROR_MESSAGES.OPERATION_NOT_FOUND
      });
    }
    
    res.status(HTTP_STATUS.OK).json({
      message: 'Opération supprimée avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'opération:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR
    });
  }
}

/**
 * Récupère les statistiques globales pour le tableau de bord
 * @param req Requête Express
 * @param res Réponse Express
 */
export async function getStats(req: Request, res: Response) {
  try {
    // Récupération de toutes les opérations
    const operations = await storage.getOperations();
    
    // Calculer les métriques globales
    const totalOperations = operations.length;
    let totalVolume = 0;
    let totalMetrage = 0;
    const methodeCount: Record<string, number> = {};
    const panneauCount: Record<string, number> = {};
    
    // Calculer les statistiques par méthode
    operations.forEach((op) => {
      // Volumétrie
      totalVolume += op.volume || 0;
      totalMetrage += op.metrage || 0;
      
      // Comptage par méthode
      const methode = op.methode;
      methodeCount[methode] = (methodeCount[methode] || 0) + 1;
      
      // Comptage par panneau
      const panneau = op.panneau;
      if (panneau) {
        panneauCount[panneau] = (panneauCount[panneau] || 0) + 1;
      }
    });
    
    // Calculer les moyennes
    const avgRendement = operations.length > 0
      ? operations.reduce((sum, op) => sum + (op.rendement || 0), 0) / operations.length
      : 0;
    
    const avgDisponibilite = operations.length > 0
      ? operations.reduce((sum, op) => sum + (op.disponibilite || 0), 0) / operations.length
      : 0;
    
    // Récupérer les dernières opérations
    const recentOperations = [...operations]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
    
    res.status(HTTP_STATUS.OK).json({
      totalOperations,
      totalVolume,
      totalMetrage,
      avgRendement,
      avgDisponibilite,
      methodeSummary: methodeCount,
      panneauSummary: panneauCount,
      recentOperations
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR
    });
  }
}

/**
 * Récupère les statistiques de performance pour les graphiques
 * @param req Requête Express
 * @param res Réponse Express
 */
export async function getPerformanceStats(req: Request, res: Response) {
  try {
    const timeRange = req.query.timeRange as string || '30d';
    const methode = req.query.methode as string || 'all';
    
    // Récupérer toutes les opérations
    const operations = await storage.getOperations();
    
    // Filtrer selon la plage de temps
    const cutoffDate = getTimeRangeCutoff(timeRange);
    
    // Filtrer les opérations selon la plage de temps et la méthode
    const filteredOperations = operations.filter(op => {
      const opDate = new Date(op.date);
      const matchesTimeRange = cutoffDate ? opDate >= cutoffDate : true;
      const matchesMethode = methode === 'all' || op.methode === methode;
      return matchesTimeRange && matchesMethode;
    });
    
    // Organiser les données pour les graphiques
    const rendementByDate: Record<string, number> = {};
    const disponibiliteByDate: Record<string, number> = {};
    const volumeByDate: Record<string, number> = {};
    
    // Grouper par date
    filteredOperations.forEach(op => {
      const dateStr = new Date(op.date).toISOString().split('T')[0]; // Format YYYY-MM-DD
      
      if (!rendementByDate[dateStr]) {
        rendementByDate[dateStr] = 0;
        disponibiliteByDate[dateStr] = 0;
        volumeByDate[dateStr] = 0;
      }
      
      // Accumuler les valeurs
      rendementByDate[dateStr] += op.rendement || 0;
      disponibiliteByDate[dateStr] += op.disponibilite || 0;
      volumeByDate[dateStr] += op.volume || 0;
    });
    
    // Convertir les données en format pour graphique
    const rendementData = Object.entries(rendementByDate).map(([date, value]) => ({ date, value }));
    const disponibiliteData = Object.entries(disponibiliteByDate).map(([date, value]) => ({ date, value }));
    const volumeData = Object.entries(volumeByDate).map(([date, value]) => ({ date, value }));
    
    // Trier par date
    rendementData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    disponibiliteData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    volumeData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    res.status(HTTP_STATUS.OK).json({
      rendementData,
      disponibiliteData,
      volumeData,
      summary: {
        avgRendement: filteredOperations.length > 0
          ? filteredOperations.reduce((sum, op) => sum + (op.rendement || 0), 0) / filteredOperations.length
          : 0,
        avgDisponibilite: filteredOperations.length > 0
          ? filteredOperations.reduce((sum, op) => sum + (op.disponibilite || 0), 0) / filteredOperations.length
          : 0,
        totalVolume: filteredOperations.reduce((sum, op) => sum + (op.volume || 0), 0),
        totalMetrage: filteredOperations.reduce((sum, op) => sum + (op.metrage || 0), 0),
        operationCount: filteredOperations.length
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques de performance:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR
    });
  }
}

/**
 * Récupère les statistiques de progression pour le suivi d'avancement
 * @param req Requête Express
 * @param res Réponse Express
 */
export async function getProgressStats(req: Request, res: Response) {
  try {
    const panneau = req.query.panneau as string;
    
    // Récupérer toutes les opérations ou celles filtrées par panneau
    const filter: { panneau?: string } = {};
    if (panneau) {
      filter.panneau = panneau;
    }
    
    const operations = await storage.getOperations(filter);
    
    // Calculer la progression par panneau
    const progressByPanneau: Record<string, { 
      total: number, 
      completed: number, 
      percentComplete: number,
      volume: number,
      volumeTotal: number,
      metrage: number,
      metrageTotal: number
    }> = {};
    
    // Supposons qu'un panneau a un volume cible total pour le projet (à ajuster selon vos besoins)
    const panneauVolumeTargets: Record<string, number> = {
      'P1': 50000,
      'P2': 75000,
      'P3': 60000,
      'P4': 80000,
      'P5': 55000
    };
    
    const panneauMetrageTargets: Record<string, number> = {
      'P1': 5000,
      'P2': 7500,
      'P3': 6000,
      'P4': 8000,
      'P5': 5500
    };
    
    // Regrouper et calculer les statistiques par panneau
    operations.forEach(op => {
      if (!op.panneau) return;
      
      if (!progressByPanneau[op.panneau]) {
        progressByPanneau[op.panneau] = {
          total: panneauVolumeTargets[op.panneau] || 100000, // Valeur par défaut si non définie
          completed: 0,
          percentComplete: 0,
          volume: 0,
          volumeTotal: panneauVolumeTargets[op.panneau] || 100000,
          metrage: 0,
          metrageTotal: panneauMetrageTargets[op.panneau] || 10000
        };
      }
      
      // Accumuler le volume et le métrage
      progressByPanneau[op.panneau].volume += op.volume || 0;
      progressByPanneau[op.panneau].metrage += op.metrage || 0;
      
      // Calculer le pourcentage d'achèvement basé sur le volume
      progressByPanneau[op.panneau].completed = progressByPanneau[op.panneau].volume;
      progressByPanneau[op.panneau].percentComplete = Math.min(
        100,
        (progressByPanneau[op.panneau].volume / progressByPanneau[op.panneau].volumeTotal) * 100
      );
    });
    
    // Convertir en format pour le frontend
    const progressData = Object.entries(progressByPanneau).map(([panneau, data]) => ({
      panneau,
      ...data
    }));
    
    // Calculer les statistiques globales
    const totalVolume = operations.reduce((sum, op) => sum + (op.volume || 0), 0);
    const totalMetrage = operations.reduce((sum, op) => sum + (op.metrage || 0), 0);
    const totalVolumeTarget = Object.values(panneauVolumeTargets).reduce((sum, value) => sum + value, 0);
    const totalMetrageTarget = Object.values(panneauMetrageTargets).reduce((sum, value) => sum + value, 0);
    
    const globalProgress = {
      totalVolume,
      totalMetrage,
      totalVolumeTarget,
      totalMetrageTarget,
      percentVolumeComplete: (totalVolume / totalVolumeTarget) * 100,
      percentMetrageComplete: (totalMetrage / totalMetrageTarget) * 100
    };
    
    res.status(HTTP_STATUS.OK).json({
      progressData,
      globalProgress
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques de progression:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR
    });
  }
}

/**
 * Récupère les statistiques de volume par méthode de décapage
 * @param req Requête Express
 * @param res Réponse Express
 */
export async function getVolumeStats(req: Request, res: Response) {
  try {
    const timeRange = req.query.timeRange as string || '30d';
    
    // Récupérer toutes les opérations
    const operations = await storage.getOperations();
    
    // Filtrer selon la plage de temps
    const cutoffDate = getTimeRangeCutoff(timeRange);
    
    const filteredOperations = operations.filter(op => {
      const opDate = new Date(op.date);
      return cutoffDate ? opDate >= cutoffDate : true;
    });
    
    // Calculer le volume par méthode
    const volumeByMethod: Record<string, number> = {};
    const metrageByMethod: Record<string, number> = {};
    
    filteredOperations.forEach(op => {
      if (!volumeByMethod[op.methode]) {
        volumeByMethod[op.methode] = 0;
        metrageByMethod[op.methode] = 0;
      }
      
      volumeByMethod[op.methode] += op.volume || 0;
      metrageByMethod[op.methode] += op.metrage || 0;
    });
    
    // Convertir en format pour graphique
    const volumeData = Object.entries(volumeByMethod).map(([methode, volume]) => ({
      methode,
      volume
    }));
    
    const metrageData = Object.entries(metrageByMethod).map(([methode, metrage]) => ({
      methode,
      metrage
    }));
    
    // Récupérer les statistiques de volume par jour
    const volumeByDate: Record<string, Record<string, number>> = {};
    
    filteredOperations.forEach(op => {
      const dateStr = new Date(op.date).toISOString().split('T')[0]; // Format YYYY-MM-DD
      
      if (!volumeByDate[dateStr]) {
        volumeByDate[dateStr] = {};
      }
      
      if (!volumeByDate[dateStr][op.methode]) {
        volumeByDate[dateStr][op.methode] = 0;
      }
      
      volumeByDate[dateStr][op.methode] += op.volume || 0;
    });
    
    // Convertir en format pour graphique avec série temporelle
    const volumeTimeSeriesData = Object.entries(volumeByDate).map(([date, volumes]) => ({
      date,
      ...volumes
    }));
    
    // Trier par date
    volumeTimeSeriesData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    res.status(HTTP_STATUS.OK).json({
      volumeByMethod: volumeData,
      metrageByMethod: metrageData,
      volumeTimeSeries: volumeTimeSeriesData,
      totalVolume: filteredOperations.reduce((sum, op) => sum + (op.volume || 0), 0),
      totalMetrage: filteredOperations.reduce((sum, op) => sum + (op.metrage || 0), 0)
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques de volume:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR
    });
  }
}

/**
 * Fonction utilitaire pour obtenir la date de début pour une plage de temps
 * @param timeRange La plage de temps (7d, 30d, 90d, 365d, all)
 * @returns La date de début ou null si 'all'
 */
function getTimeRangeCutoff(timeRange: string): Date | null {
  const now = new Date();
  
  switch (timeRange) {
    case '7d':
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    case '30d':
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    case '90d':
      return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    case '365d':
      return new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
    case 'all':
    default:
      return null;
  }
}