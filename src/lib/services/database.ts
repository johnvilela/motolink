import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg"; // Ensure you have 'pg' installed
import { PrismaClient } from "../../../generated/prisma/client";

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

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

export default prisma;

if (!isProd) {
  globalThis.prismaGlobal = prisma;
}
