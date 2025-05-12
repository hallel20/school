import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function saveDbToJson() {
  try {
    const models = Object.keys(prisma).filter(
      (key) => !key.startsWith('$') && !key.startsWith('_'),
    );

    const data: { [key: string]: any[] } = {};

    for (const model of models) {
      data[model] = await (prisma[model as keyof typeof prisma] as any).findMany();
    }

    const filePath = path.join(__dirname, '..', 'db_backup.json');
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

    console.log(`Database saved to ${filePath}`);
  } catch (error) {
    console.error('Error saving database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

saveDbToJson();
