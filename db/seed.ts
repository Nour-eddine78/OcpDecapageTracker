import { db } from '../server/db';
import { users, machines } from '../shared/schema';
import { hashPassword } from '../server/auth';

async function main() {
  console.log('Seeding database...');

  // Create initial admin user
  const adminPassword = await hashPassword('admin123');
  await db.insert(users).values({
    username: 'admin',
    password: adminPassword,
    name: 'Administrator',
    role: 'admin'
  }).onConflictDoNothing();

  // Create supervisor user
  const supervisorPassword = await hashPassword('super123');
  await db.insert(users).values({
    username: 'supervisor',
    password: supervisorPassword,
    name: 'Ahmed Samir',
    role: 'supervisor'
  }).onConflictDoNothing();

  // Create sample machines
  // Transport machines
  await db.insert(machines).values({
    machineId: 'TWN-012',
    name: 'Transwine 789D',
    type: 'Camion',
    capacity: '180 tonnes',
    methode: 'Transport',
    status: 'En service',
    specifications: {}
  }).onConflictDoNothing();

  await db.insert(machines).values({
    machineId: 'PCQ-001',
    name: 'Procaneq TR-70',
    type: 'Camion',
    capacity: '120 tonnes',
    methode: 'Transport',
    status: 'En service',
    specifications: {}
  }).onConflictDoNothing();

  // Poussage machines
  await db.insert(machines).values({
    machineId: 'BLD-001',
    name: 'D11 Bulldozer',
    type: 'Bulldozer',
    capacity: '850 HP',
    methode: 'Poussage',
    status: 'En service',
    specifications: {}
  }).onConflictDoNothing();

  // Casement machines
  await db.insert(machines).values({
    machineId: 'EXC-PH1',
    name: 'PH1 Excavatrice',
    type: 'Excavatrice',
    capacity: '35 m³',
    methode: 'Casement',
    status: 'Maintenance',
    specifications: {}
  }).onConflictDoNothing();

  await db.insert(machines).values({
    machineId: '750011',
    name: 'Excavateur 750011',
    type: 'Excavateur',
    capacity: '40 m³',
    methode: 'Casement',
    status: 'En service',
    specifications: {}
  }).onConflictDoNothing();

  await db.insert(machines).values({
    machineId: '750012',
    name: 'Excavateur 750012',
    type: 'Excavateur',
    capacity: '40 m³',
    methode: 'Casement',
    status: 'En service',
    specifications: {}
  }).onConflictDoNothing();

  console.log('Database seeded successfully!');
  process.exit(0);
}

main().catch(e => {
  console.error('Error seeding database:', e);
  process.exit(1);
});