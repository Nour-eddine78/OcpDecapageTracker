import { Express } from 'express';
import { createServer } from 'http';
import * as operationController from './controllers/operations';
import * as userController from './controllers/users';
import * as machineController from './controllers/machines';
import * as safetyController from './controllers/safety';
import { authenticate } from './middlewares/auth.middleware';

export async function registerRoutes(app: Express) {
  // Auth routes
  app.post("/api/auth/login", userController.login);
  app.post("/api/auth/register", userController.register);

  // Operation routes
  app.get("/api/operations", authenticate, operationController.getOperations);
  app.post("/api/operations", authenticate, operationController.createOperation);
  app.patch("/api/operations/:id", authenticate, operationController.updateOperation);
  app.delete("/api/operations/:id", authenticate, operationController.deleteOperation);

    // Auth check route
  app.get("/api/auth/check", authenticate, userController.checkAuth);
  
  // User routes (authenticated)
  app.get("/api/users", authenticate, userController.getUsers);
  app.get("/api/users/:id", authenticate, userController.getUserById);
  app.post("/api/users", authenticate, userController.createUser);
  app.patch("/api/users/:id", authenticate, userController.updateUser);
  app.delete("/api/users/:id", authenticate, userController.deleteUser);
  
  // Machine routes
  app.get("/api/machines", authenticate, machineController.getMachines);
  app.get("/api/machines/:id", authenticate, machineController.getMachineById);
  app.post("/api/machines", authenticate, machineController.createMachine);
  app.patch("/api/machines/:id", authenticate, machineController.updateMachine);
  app.delete("/api/machines/:id", authenticate, machineController.deleteMachine);
  
  // Safety incident routes
  app.get("/api/safety", authenticate, safetyController.getSafetyIncidents);
  app.get("/api/safety/:id", authenticate, safetyController.getSafetyIncidentById);
  app.post("/api/safety", authenticate, safetyController.createSafetyIncident);
  app.patch("/api/safety/:id", authenticate, safetyController.updateSafetyIncident);
  app.delete("/api/safety/:id", authenticate, safetyController.deleteSafetyIncident);
  
  // Statistics routes
  app.get("/api/stats", authenticate, operationController.getStats);
  app.get("/api/stats/performance", authenticate, operationController.getPerformanceStats);
  app.get("/api/stats/volume", authenticate, operationController.getVolumeStats);
  app.get("/api/progress", authenticate, operationController.getProgressStats);

  // Create HTTP server
  const httpServer = createServer(app);
  return httpServer;
}