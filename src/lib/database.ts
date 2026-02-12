import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { PrismaClient } from "../../generated/prisma/client";

const isProd = process.env.NODE_ENV === "production";

const prismaClientSingleton = () => {
  const connectionString = `${process.env.DATABASE_URL}`;

  const pool = new Pool({
    connectionString,
    ssl: isProd ? { rejectUnauthorized: false } : undefined,
  });

  const adapter = new PrismaPg(pool);

  return new PrismaClient({ adapter });
};

declare global {
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>;
}

const db = globalThis.prismaGlobal ?? prismaClientSingleton();

if (!isProd) {
  globalThis.prismaGlobal = db;
}

export { db };
