const { PrismaClient } = require('@prisma/client');
const fs = require('fs').promises;
const path = require('path');

async function main() {
  const prisma = new PrismaClient();

  try {
    const schema =
      await prisma.$queryRaw`SELECT table_name FROM information_schema.tables WHERE table_schema = DATABASE() AND table_type = 'BASE TABLE'`;
    const data = {};

    for (const table of schema) {
      const tableName = table.table_name;
      // Skip Prisma's internal tables if any (e.g., _prisma_migrations)
      if (!tableName.startsWith('_')) {
        data[tableName] = await prisma.$queryRawUnsafe(
          `SELECT * FROM ${tableName}`
        );
      }
    }

    const jsonData = JSON.stringify(data, null, 2);
    const outputPath = path.join(__dirname, 'database_export.json');

    await fs.writeFile(outputPath, jsonData, 'utf8');
    console.log(`Data exported to ${outputPath}`);
  } catch (error) {
    console.error('Error exporting data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
