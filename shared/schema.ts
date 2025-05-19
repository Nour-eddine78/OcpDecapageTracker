import { pgTable, text, serial, integer, boolean, jsonb, timestamp, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users Table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  role: text("role").notNull().default("supervisor"), // admin or supervisor
  createdAt: timestamp("created_at").defaultNow().notNull(),
  lastLogin: timestamp("last_login"),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  lastLogin: true,
});

// Machines Table
export const machines = pgTable("machines", {
  id: serial("id").primaryKey(),
  machineId: text("machine_id").notNull().unique(),
  name: text("name").notNull(),
  type: text("type").notNull(),
  capacity: text("capacity").notNull(),
  methode: text("methode").notNull(), // Transport, Poussage, Casement
  status: text("status").notNull().default("En service"), // En service, Maintenance, Hors service
  specifications: jsonb("specifications"), // JSON data for specifications
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertMachineSchema = createInsertSchema(machines).omit({
  id: true,
  createdAt: true,
});

// Operations Table
export const operations = pgTable("operations", {
  id: serial("id").primaryKey(),
  operationId: text("operation_id").notNull().unique(),
  date: text("date").notNull(),
  methode: text("methode").notNull(), // Transport, Poussage, Casement
  machine: text("machine").notNull(),
  poste: text("poste").notNull(), // 1, 2, 3
  panneau: text("panneau").notNull(),
  tranche: text("tranche").notNull(),
  niveau: text("niveau").notNull(),
  etatMachine: text("etat_machine").notNull(), // marche, arret
  heuresMarche: real("heures_marche").notNull(),
  dureeArret: real("duree_arret").notNull(),
  observation: text("observation"),
  volumeSaute: real("volume_saute").notNull(),
  metrage: real("metrage"),
  rendement: real("rendement"),
  disponibilite: real("disponibilite"),
  methodSpecificData: jsonb("method_specific_data"), // JSON data for method-specific fields
  createdBy: integer("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at"),
});

export const insertOperationSchema = createInsertSchema(operations).omit({
  id: true,
  metrage: true,
  rendement: true,
  disponibilite: true,
  createdAt: true,
  updatedAt: true,
});

// Safety Incidents Table
export const safetyIncidents = pgTable("safety_incidents", {
  id: serial("id").primaryKey(),
  incidentId: text("incident_id").notNull().unique(),
  date: text("date").notNull(),
  type: text("type").notNull(), // HSE, Technique, Autre
  severity: text("severity").notNull(), // Bas, Moyen, Élevé, Critique
  location: text("location").notNull(),
  description: text("description").notNull(),
  actions: text("actions"),
  status: text("status").notNull().default("Ouvert"), // Ouvert, En cours, Résolu
  reportedBy: integer("reported_by").notNull(),
  resolvedBy: integer("resolved_by"),
  resolvedAt: timestamp("resolved_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at"),
});

export const insertSafetyIncidentSchema = createInsertSchema(safetyIncidents).omit({
  id: true,
  resolvedBy: true,
  resolvedAt: true,
  createdAt: true,
  updatedAt: true,
});

// Exports for types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertMachine = z.infer<typeof insertMachineSchema>;
export type Machine = typeof machines.$inferSelect;

export type InsertOperation = z.infer<typeof insertOperationSchema>;
export type Operation = typeof operations.$inferSelect;

export type InsertSafetyIncident = z.infer<typeof insertSafetyIncidentSchema>;
export type SafetyIncident = typeof safetyIncidents.$inferSelect;
