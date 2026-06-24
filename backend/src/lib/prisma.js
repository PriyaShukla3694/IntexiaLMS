import { PrismaClient } from "@prisma/client";

import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);

const globalForPrisma = global;
globalForPrisma.prisma ??= new PrismaClient({ adapter });

export const prisma = globalForPrisma.prisma;
