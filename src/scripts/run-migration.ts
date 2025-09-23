import { ConvexHttpClient } from "convex/browser";
import { api } from "../../convex/_generated/api";

const client = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

async function runMigration() {
  console.log("🚀 Starting data migration from JSON Server to Convex...");

  try {
    const result = await client.mutation(api.migrations.runFullMigration, {});
    console.log("✅ Migration completed successfully:", result);

    // Verify data
    const users = await client.query(api.users.getAll, {});
    const courses = await client.query(api.courses.getAll, {});
    const bundles = await client.query(api.bundlePackages.getAll, {});

    console.log(`📊 Data verification:`);
    console.log(`- Users: ${users.length} records`);
    console.log(`- Courses: ${courses.length} records`);
    console.log(`- Bundles: ${bundles.length} records`);

  } catch (error) {
    console.error("❌ Migration failed:", error);
    throw error;
  }
}

// Run migration if this script is called directly
if (require.main === module) {
  runMigration()
    .then(() => {
      console.log("🎉 Migration process completed!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("💥 Migration process failed:", error);
      process.exit(1);
    });
}

export { runMigration };