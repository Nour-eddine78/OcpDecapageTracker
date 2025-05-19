import { pgTable, text, timestamp, integer, boolean, serial, real } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: text('username').notNull().unique(),
  password: text('password').notNull(),
  role: text('role', { enum: ['admin', 'supervisor', 'user'] }).notNull().default('user'),
  createdAt: timestamp('created_at').defaultNow()
});

export const machines = pgTable('machines', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  type: text('type').notNull(),
  status: text('status', { enum: ['active', 'maintenance', 'inactive'] }).notNull(),
  lastMaintenance: timestamp('last_maintenance'),
  hoursWorked: real('hours_worked').default(0),
  createdAt: timestamp('created_at').defaultNow()
});

export const operations = pgTable('operations', {
  id: serial('id').primaryKey(),
  methode: text('methode').notNull(),
  machine_id: integer('machine_id').references(() => machines.id),
  operateur_id: integer('operateur_id').references(() => users.id),
  volume: real('volume').notNull(),
  duree: real('duree').notNull(),
  rendement: real('rendement'),
  status: text('status', { enum: ['en_cours', 'termine', 'annule'] }).notNull(),
  date_debut: timestamp('date_debut').notNull(),
  date_fin: timestamp('date_fin'),
  createdAt: timestamp('created_at').defaultNow()
});

export const safety_incidents = pgTable('safety_incidents', {
  id: serial('id').primaryKey(),
  operation_id: integer('operation_id').references(() => operations.id),
  type: text('type').notNull(),
  description: text('description').notNull(),
  severity: text('severity', { enum: ['low', 'medium', 'high', 'critical'] }).notNull(),
  status: text('status', { enum: ['open', 'investigating', 'resolved'] }).notNull(),
  reporter_id: integer('reporter_id').references(() => users.id),
  date_reported: timestamp('date_reported').notNull(),
  date_resolved: timestamp('date_resolved'),
  createdAt: timestamp('created_at').defaultNow()
});