import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { TableName } from '@prisma/client';

const prisma = new PrismaClient();

export const nextUserIdController = async (req: Request, res: Response) => {
  try {
    const table = req.query.table as TableName | 'all';
    // Check if the table name is valid
    if (table === 'all') {
      const nextIds = await prisma.nextId.findMany();
      const response = nextIds.reduce((acc, curr) => {
        acc[curr.tableName] = curr.nextId;
        return acc;
      }, {} as Record<string, number>);
      return res.send(response);
    }
    // Validate table name
    if (!Object.values(TableName).includes(table)) {
      return res.status(400).send({ message: 'Invalid table name' });
    }

    const response = await prisma.nextId.findUnique({
      where: { tableName: table },
    });
    res.send({ nextId: response?.nextId });
  } catch (error) {
    console.log(error)
    res.status(500).send({ message: 'Server error' });
  }
}
