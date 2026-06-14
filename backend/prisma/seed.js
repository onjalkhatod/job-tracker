const { PrismaClient } = require('@prisma/client');
const { runSeedScript } = require('./seedUtils'); // Ensure the path is correct

const prisma = new PrismaClient();

async function main() {
  try {
    await runSeedScript(prisma); // Pass the instance
    console.log("✅ Seed completed successfully!");
  } catch (error) {
    console.error("❌ Seed failed:", error);
  } finally {
    await prisma.$disconnect();
    process.exit(0);
  }
}

main();