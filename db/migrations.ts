
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { db } from "../server/db";

async function main() {
  console.log("Running migrations...");
  await migrate(db, { migrationsFolder: "db/migrations" });
  console.log("Migrations completed!");
}

main().catch((err) => {
  console.error("Error running migrations:", err);
  process.exit(1);
});
