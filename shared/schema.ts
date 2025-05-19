import { relations } from 'drizzle-orm';
import { integer, pgTable, serial, text, timestamp, varchar } from 'drizzle-orm/pg-core';
import { z } from 'zod';

// Database tables
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: varchar('username', { length: 100 }).unique().notNull(),
  password: varchar('password', { length: 100 }).notNull(),
  name: varchar('name', { length: 100 }).notNull(),
  role: varchar('role', { length: 50 }).notNull(),
  createdAt: timestamp('created_at').defaultNow()
});

export const machines = pgTable('machines', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  type: varchar('type', { length: 50 }).notNull(),
  status: varchar('status', { length: 50 }).notNull(),
  disponibilite: integer('disponibilite').notNull(),
  lastMaintenance: timestamp('last_maintenance'),
  nextMaintenance: timestamp('next_maintenance'),
  createdAt: timestamp('created_at').defaultNow()
});

export const operations = pgTable('operations', {
  id: serial('id').primaryKey(),
  operationId: varchar('operation_id', { length: 100 }).unique().notNull(),
  machineId: integer('machine_id').references(() => machines.id).notNull(),
  userId: integer('user_id').references(() => users.id).notNull(),
  methode: varchar('methode', { length: 50 }).notNull(),
  poste: varchar('poste', { length: 50 }).notNull(),
  panneau: varchar('panneau', { length: 100 }).notNull(),
  volume: integer('volume').notNull(),
  metrage: integer('metrage').notNull(),
  rendement: integer('rendement').notNull(),
  disponibilite: integer('disponibilite').notNull(),
  date: timestamp('date').notNull(),
  createdAt: timestamp('created_at').defaultNow()
});

export const safetyIncidents = pgTable('safety_incidents', {
  id: serial('id').primaryKey(),
  reportId: varchar('report_id', { length: 100 }).unique().notNull(),
  userId: integer('user_id').references(() => users.id).notNull(),
  type: varchar('type', { length: 50 }).notNull(),
  severity: varchar('severity', { length: 50 }).notNull(),
  description: text('description').notNull(),
  location: varchar('location', { length: 100 }).notNull(),
  date: timestamp('date').notNull(),
  status: varchar('status', { length: 50 }).notNull(),
  actions: text('actions'),
  createdAt: timestamp('created_at').defaultNow()
});

export const operationsRelations = relations(operations, ({ one }) => ({
  machine: one(machines, {
    fields: [operations.machineId],
    references: [machines.id],
  }),
  user: one(users, {
    fields: [operations.userId],
    references: [users.id],
  }),
}));

export const safetyIncidentsRelations = relations(safetyIncidents, ({ one }) => ({
  user: one(users, {
    fields: [safetyIncidents.userId],
    references: [users.id],
  }),
}));

// Zod Schemas for validation
export const insertUserSchema = z.object({
  username: z.string().min(3).max(100),
  password: z.string().min(6).max(100),
  name: z.string().min(2).max(100),
  role: z.enum(['admin', 'supervisor', 'operator'])
});

export const insertOperationSchema = z.object({
  machineId: z.number(),
  userId: z.number(),
  methode: z.string(),
  poste: z.string(),
  panneau: z.string(),
  volume: z.number(),
  metrage: z.number(),
  rendement: z.number(),
  disponibilite: z.number(),
  date: z.date()
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Machine = typeof machines.$inferSelect;
export type InsertMachine = typeof machines.$inferInsert;
export type Operation = typeof operations.$inferSelect;
export type InsertOperation = typeof operations.$inferInsert;
export type SafetyIncident = typeof safetyIncidents.$inferSelect;
export type InsertSafetyIncident = typeof safetyIncidents.$inferInsert;