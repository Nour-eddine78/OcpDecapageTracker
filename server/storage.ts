import { 
  User, InsertUser, users,
  Machine, InsertMachine, machines,
  Operation, InsertOperation, operations,
  SafetyIncident, InsertSafetyIncident, safetyIncidents
} from "@shared/schema";
import { eq, like, and, or } from "drizzle-orm";

// Interface for the storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, userData: Partial<User>): Promise<User | undefined>;
  getUsers(): Promise<User[]>;
  deleteUser(id: number): Promise<boolean>;

  // Machine operations
  getMachine(id: number): Promise<Machine | undefined>;
  getMachineByMachineId(machineId: string): Promise<Machine | undefined>;
  createMachine(machine: InsertMachine): Promise<Machine>;
  updateMachine(id: number, machineData: Partial<Machine>): Promise<Machine | undefined>;
  getMachines(filter?: { methode?: string }): Promise<Machine[]>;
  deleteMachine(id: number): Promise<boolean>;

  // Operation operations
  getOperation(id: number): Promise<Operation | undefined>;
  getOperationByOperationId(operationId: string): Promise<Operation | undefined>;
  createOperation(operation: InsertOperation): Promise<Operation>;
  updateOperation(id: number, operationData: Partial<Operation>): Promise<Operation | undefined>;
  getOperations(filter?: { methode?: string, panneau?: string }): Promise<Operation[]>;
  deleteOperation(id: number): Promise<boolean>;

  // Safety incident operations
  getSafetyIncident(id: number): Promise<SafetyIncident | undefined>;
  getSafetyIncidentByIncidentId(incidentId: string): Promise<SafetyIncident | undefined>;
  createSafetyIncident(incident: InsertSafetyIncident): Promise<SafetyIncident>;
  updateSafetyIncident(id: number, incidentData: Partial<SafetyIncident>): Promise<SafetyIncident | undefined>;
  getSafetyIncidents(filter?: { type?: string, severity?: string, status?: string }): Promise<SafetyIncident[]>;
  deleteSafetyIncident(id: number): Promise<boolean>;
}

// In-memory implementation of the storage interface
export class MemStorage implements IStorage {
  private usersMap: Map<number, User>;
  private machinesMap: Map<number, Machine>;
  private operationsMap: Map<number, Operation>;
  private safetyIncidentsMap: Map<number, SafetyIncident>;
  
  private userCurrentId: number;
  private machineCurrentId: number;
  private operationCurrentId: number;
  private safetyIncidentCurrentId: number;

  constructor() {
    this.usersMap = new Map();
    this.machinesMap = new Map();
    this.operationsMap = new Map();
    this.safetyIncidentsMap = new Map();
    
    this.userCurrentId = 1;
    this.machineCurrentId = 1;
    this.operationCurrentId = 1;
    this.safetyIncidentCurrentId = 1;

    // Create initial admin user
    this.createUser({
      username: "admin",
      password: "admin123",
      name: "Administrator",
      role: "admin"
    });

    // Create supervisor user
    this.createUser({
      username: "supervisor",
      password: "super123",
      name: "Ahmed Samir",
      role: "supervisor"
    });

    // Create sample machines
    this.createInitialMachines();
  }

  private createInitialMachines() {
    // Transport machines
    this.createMachine({
      machineId: "TWN-012",
      name: "Transwine 789D",
      type: "Camion",
      capacity: "180 tonnes",
      methode: "Transport",
      status: "En service",
      specifications: {}
    });

    this.createMachine({
      machineId: "PCQ-001",
      name: "Procaneq TR-70",
      type: "Camion",
      capacity: "120 tonnes",
      methode: "Transport",
      status: "En service",
      specifications: {}
    });

    // Poussage machines
    this.createMachine({
      machineId: "BLD-001",
      name: "D11 Bulldozer",
      type: "Bulldozer",
      capacity: "850 HP",
      methode: "Poussage",
      status: "En service",
      specifications: {}
    });

    // Casement machines
    this.createMachine({
      machineId: "EXC-PH1",
      name: "PH1 Excavatrice",
      type: "Excavatrice",
      capacity: "35 m³",
      methode: "Casement",
      status: "Maintenance",
      specifications: {}
    });

    this.createMachine({
      machineId: "750011",
      name: "Excavateur 750011",
      type: "Excavateur",
      capacity: "40 m³",
      methode: "Casement",
      status: "En service",
      specifications: {}
    });

    this.createMachine({
      machineId: "750012",
      name: "Excavateur 750012",
      type: "Excavateur",
      capacity: "40 m³",
      methode: "Casement",
      status: "En service",
      specifications: {}
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.usersMap.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.usersMap.values()).find(
      (user) => user.username === username
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const createdAt = new Date();
    const user: User = { ...insertUser, id, createdAt, lastLogin: null };
    this.usersMap.set(id, user);
    return user;
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const user = this.usersMap.get(id);
    if (!user) return undefined;

    const updatedUser = { ...user, ...userData };
    this.usersMap.set(id, updatedUser);
    return updatedUser;
  }

  async getUsers(): Promise<User[]> {
    return Array.from(this.usersMap.values());
  }

  async deleteUser(id: number): Promise<boolean> {
    return this.usersMap.delete(id);
  }

  // Machine methods
  async getMachine(id: number): Promise<Machine | undefined> {
    return this.machinesMap.get(id);
  }

  async getMachineByMachineId(machineId: string): Promise<Machine | undefined> {
    return Array.from(this.machinesMap.values()).find(
      (machine) => machine.machineId === machineId
    );
  }

  async createMachine(insertMachine: InsertMachine): Promise<Machine> {
    const id = this.machineCurrentId++;
    const createdAt = new Date();
    const machine: Machine = { ...insertMachine, id, createdAt };
    this.machinesMap.set(id, machine);
    return machine;
  }

  async updateMachine(id: number, machineData: Partial<Machine>): Promise<Machine | undefined> {
    const machine = this.machinesMap.get(id);
    if (!machine) return undefined;

    const updatedMachine = { ...machine, ...machineData };
    this.machinesMap.set(id, updatedMachine);
    return updatedMachine;
  }

  async getMachines(filter?: { methode?: string }): Promise<Machine[]> {
    let machines = Array.from(this.machinesMap.values());
    
    if (filter?.methode && filter.methode !== "all") {
      machines = machines.filter(machine => machine.methode === filter.methode);
    }
    
    return machines;
  }

  async deleteMachine(id: number): Promise<boolean> {
    return this.machinesMap.delete(id);
  }

  // Operation methods
  async getOperation(id: number): Promise<Operation | undefined> {
    return this.operationsMap.get(id);
  }

  async getOperationByOperationId(operationId: string): Promise<Operation | undefined> {
    return Array.from(this.operationsMap.values()).find(
      (operation) => operation.operationId === operationId
    );
  }

  async createOperation(insertOperation: InsertOperation): Promise<Operation> {
    const id = this.operationCurrentId++;
    const createdAt = new Date();
    
    // Calculate performance metrics
    const metrage = Math.round(insertOperation.volumeSaute * 0.4); // Example calculation
    const rendement = insertOperation.heuresMarche > 0 ? Math.round(metrage / insertOperation.heuresMarche) : 0;
    const disponibilite = Math.round((insertOperation.heuresMarche / (insertOperation.heuresMarche + insertOperation.dureeArret)) * 100);

    const operation: Operation = {
      ...insertOperation,
      id,
      metrage,
      rendement,
      disponibilite,
      createdAt,
      updatedAt: null
    };
    
    this.operationsMap.set(id, operation);
    return operation;
  }

  async updateOperation(id: number, operationData: Partial<Operation>): Promise<Operation | undefined> {
    const operation = this.operationsMap.get(id);
    if (!operation) return undefined;

    // Recalculate metrics if relevant fields changed
    let metrage = operation.metrage;
    let rendement = operation.rendement;
    let disponibilite = operation.disponibilite;

    if (operationData.volumeSaute !== undefined || operationData.heuresMarche !== undefined || operationData.dureeArret !== undefined) {
      const volumeSaute = operationData.volumeSaute !== undefined ? operationData.volumeSaute : operation.volumeSaute;
      const heuresMarche = operationData.heuresMarche !== undefined ? operationData.heuresMarche : operation.heuresMarche;
      const dureeArret = operationData.dureeArret !== undefined ? operationData.dureeArret : operation.dureeArret;

      metrage = Math.round(volumeSaute * 0.4);
      rendement = heuresMarche > 0 ? Math.round(metrage / heuresMarche) : 0;
      disponibilite = Math.round((heuresMarche / (heuresMarche + dureeArret)) * 100);
    }

    const updatedOperation: Operation = {
      ...operation,
      ...operationData,
      metrage,
      rendement,
      disponibilite,
      updatedAt: new Date()
    };
    
    this.operationsMap.set(id, updatedOperation);
    return updatedOperation;
  }

  async getOperations(filter?: { methode?: string, panneau?: string }): Promise<Operation[]> {
    let operations = Array.from(this.operationsMap.values());
    
    if (filter?.methode && filter.methode !== "all") {
      operations = operations.filter(operation => operation.methode === filter.methode);
    }
    
    if (filter?.panneau) {
      operations = operations.filter(operation => operation.panneau.includes(filter.panneau));
    }
    
    return operations;
  }

  async deleteOperation(id: number): Promise<boolean> {
    return this.operationsMap.delete(id);
  }

  // Safety incident methods
  async getSafetyIncident(id: number): Promise<SafetyIncident | undefined> {
    return this.safetyIncidentsMap.get(id);
  }

  async getSafetyIncidentByIncidentId(incidentId: string): Promise<SafetyIncident | undefined> {
    return Array.from(this.safetyIncidentsMap.values()).find(
      (incident) => incident.incidentId === incidentId
    );
  }

  async createSafetyIncident(insertIncident: InsertSafetyIncident): Promise<SafetyIncident> {
    const id = this.safetyIncidentCurrentId++;
    const createdAt = new Date();
    
    const incident: SafetyIncident = {
      ...insertIncident,
      id,
      resolvedBy: null,
      resolvedAt: null,
      createdAt,
      updatedAt: null
    };
    
    this.safetyIncidentsMap.set(id, incident);
    return incident;
  }

  async updateSafetyIncident(id: number, incidentData: Partial<SafetyIncident>): Promise<SafetyIncident | undefined> {
    const incident = this.safetyIncidentsMap.get(id);
    if (!incident) return undefined;

    // If status is changed to "Résolu", set resolvedAt if not provided
    if (incidentData.status === "Résolu" && !incidentData.resolvedAt) {
      incidentData.resolvedAt = new Date();
    }

    const updatedIncident: SafetyIncident = {
      ...incident,
      ...incidentData,
      updatedAt: new Date()
    };
    
    this.safetyIncidentsMap.set(id, updatedIncident);
    return updatedIncident;
  }

  async getSafetyIncidents(filter?: { type?: string, severity?: string, status?: string }): Promise<SafetyIncident[]> {
    let incidents = Array.from(this.safetyIncidentsMap.values());
    
    if (filter?.type && filter.type !== "all") {
      incidents = incidents.filter(incident => incident.type === filter.type);
    }
    
    if (filter?.severity && filter.severity !== "all") {
      incidents = incidents.filter(incident => incident.severity === filter.severity);
    }
    
    if (filter?.status && filter.status !== "all") {
      incidents = incidents.filter(incident => incident.status === filter.status);
    }
    
    return incidents;
  }

  async deleteSafetyIncident(id: number): Promise<boolean> {
    return this.safetyIncidentsMap.delete(id);
  }
}

// Database implementation of the storage interface
import { db } from './db';

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set(userData)
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }

  async getUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async deleteUser(id: number): Promise<boolean> {
    const result = await db.delete(users).where(eq(users.id, id));
    return result.rowCount > 0;
  }

  // Machine methods
  async getMachine(id: number): Promise<Machine | undefined> {
    const [machine] = await db.select().from(machines).where(eq(machines.id, id));
    return machine;
  }

  async getMachineByMachineId(machineId: string): Promise<Machine | undefined> {
    const [machine] = await db
      .select()
      .from(machines)
      .where(eq(machines.machineId, machineId));
    return machine;
  }

  async createMachine(insertMachine: InsertMachine): Promise<Machine> {
    const [machine] = await db.insert(machines).values(insertMachine).returning();
    return machine;
  }

  async updateMachine(id: number, machineData: Partial<Machine>): Promise<Machine | undefined> {
    const [updatedMachine] = await db
      .update(machines)
      .set(machineData)
      .where(eq(machines.id, id))
      .returning();
    return updatedMachine;
  }

  async getMachines(filter?: { methode?: string }): Promise<Machine[]> {
    if (filter?.methode && filter.methode !== "all") {
      return await db
        .select()
        .from(machines)
        .where(eq(machines.methode, filter.methode));
    }
    return await db.select().from(machines);
  }

  async deleteMachine(id: number): Promise<boolean> {
    const result = await db.delete(machines).where(eq(machines.id, id));
    return result.rowCount > 0;
  }

  // Operation methods
  async getOperation(id: number): Promise<Operation | undefined> {
    const [operation] = await db.select().from(operations).where(eq(operations.id, id));
    return operation;
  }

  async getOperationByOperationId(operationId: string): Promise<Operation | undefined> {
    const [operation] = await db
      .select()
      .from(operations)
      .where(eq(operations.operationId, operationId));
    return operation;
  }

  async createOperation(insertOperation: InsertOperation): Promise<Operation> {
    // Calculate performance metrics
    const metrage = Math.round(insertOperation.volumeSaute * 0.4); // Example calculation
    const rendement = insertOperation.heuresMarche > 0 
      ? Math.round(metrage / insertOperation.heuresMarche) 
      : 0;
    const disponibilite = Math.round(
      (insertOperation.heuresMarche / 
        (insertOperation.heuresMarche + insertOperation.dureeArret)) * 100
    );

    const [operation] = await db
      .insert(operations)
      .values({
        ...insertOperation,
        metrage,
        rendement,
        disponibilite
      })
      .returning();
    
    return operation;
  }

  async updateOperation(id: number, operationData: Partial<Operation>): Promise<Operation | undefined> {
    // Get the current operation to perform calculations
    const [existingOperation] = await db
      .select()
      .from(operations)
      .where(eq(operations.id, id));
    
    if (!existingOperation) return undefined;

    // Recalculate metrics if relevant fields changed
    let metrage = existingOperation.metrage;
    let rendement = existingOperation.rendement;
    let disponibilite = existingOperation.disponibilite;

    if (operationData.volumeSaute !== undefined || 
        operationData.heuresMarche !== undefined || 
        operationData.dureeArret !== undefined) {
      
      const volumeSaute = operationData.volumeSaute !== undefined 
        ? operationData.volumeSaute 
        : existingOperation.volumeSaute;
      
      const heuresMarche = operationData.heuresMarche !== undefined 
        ? operationData.heuresMarche 
        : existingOperation.heuresMarche;
      
      const dureeArret = operationData.dureeArret !== undefined 
        ? operationData.dureeArret 
        : existingOperation.dureeArret;

      metrage = Math.round(volumeSaute * 0.4);
      rendement = heuresMarche > 0 ? Math.round(metrage / heuresMarche) : 0;
      disponibilite = Math.round((heuresMarche / (heuresMarche + dureeArret)) * 100);
    }

    // Update with new calculated values
    const [updatedOperation] = await db
      .update(operations)
      .set({
        ...operationData,
        metrage,
        rendement,
        disponibilite,
        updatedAt: new Date()
      })
      .where(eq(operations.id, id))
      .returning();
    
    return updatedOperation;
  }

  async getOperations(filter?: { methode?: string; panneau?: string }): Promise<Operation[]> {
    let query = db.select().from(operations);
    
    if (filter) {
      const conditions = [];
      
      if (filter.methode && filter.methode !== "all") {
        conditions.push(eq(operations.methode, filter.methode));
      }
      
      if (filter.panneau) {
        conditions.push(like(operations.panneau, `%${filter.panneau}%`));
      }
      
      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }
    }
    
    return await query;
  }

  async deleteOperation(id: number): Promise<boolean> {
    const result = await db.delete(operations).where(eq(operations.id, id));
    return result.rowCount > 0;
  }

  // Safety incident methods
  async getSafetyIncident(id: number): Promise<SafetyIncident | undefined> {
    const [incident] = await db
      .select()
      .from(safetyIncidents)
      .where(eq(safetyIncidents.id, id));
    return incident;
  }

  async getSafetyIncidentByIncidentId(incidentId: string): Promise<SafetyIncident | undefined> {
    const [incident] = await db
      .select()
      .from(safetyIncidents)
      .where(eq(safetyIncidents.incidentId, incidentId));
    return incident;
  }

  async createSafetyIncident(insertIncident: InsertSafetyIncident): Promise<SafetyIncident> {
    const [incident] = await db
      .insert(safetyIncidents)
      .values({
        ...insertIncident,
        status: insertIncident.status || "Ouvert"
      })
      .returning();
    return incident;
  }

  async updateSafetyIncident(id: number, incidentData: Partial<SafetyIncident>): Promise<SafetyIncident | undefined> {
    // If status is changed to "Résolu", set resolvedAt if not provided
    if (incidentData.status === "Résolu" && !incidentData.resolvedAt) {
      incidentData.resolvedAt = new Date();
    }

    const [updatedIncident] = await db
      .update(safetyIncidents)
      .set({
        ...incidentData,
        updatedAt: new Date()
      })
      .where(eq(safetyIncidents.id, id))
      .returning();
    
    return updatedIncident;
  }

  async getSafetyIncidents(filter?: { type?: string; severity?: string; status?: string }): Promise<SafetyIncident[]> {
    let query = db.select().from(safetyIncidents);
    
    if (filter) {
      const conditions = [];
      
      if (filter.type && filter.type !== "all") {
        conditions.push(eq(safetyIncidents.type, filter.type));
      }
      
      if (filter.severity && filter.severity !== "all") {
        conditions.push(eq(safetyIncidents.severity, filter.severity));
      }
      
      if (filter.status && filter.status !== "all") {
        conditions.push(eq(safetyIncidents.status, filter.status));
      }
      
      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }
    }
    
    return await query;
  }

  async deleteSafetyIncident(id: number): Promise<boolean> {
    const result = await db
      .delete(safetyIncidents)
      .where(eq(safetyIncidents.id, id));
    return result.rowCount > 0;
  }
}

// Use the database storage implementation
export const storage = new DatabaseStorage();