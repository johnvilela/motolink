import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { permissionsConst } from "@/constants/permissions";
import { hash } from "@/lib/hash";
import { PrismaClient } from "../generated/prisma/client";

const pool = new Pool({
  connectionString: `${process.env.DATABASE_URL}`,
});
const adapter = new PrismaPg(pool);
const db = new PrismaClient({ adapter });

async function main() {
  const hashedPassword = await hash().create("1234567Aa!");

  // ── Branches ──
  const branchData = [
    { code: "RJ", name: "Rio de Janeiro" },
    { code: "SP", name: "São Paulo" },
    { code: "CAM", name: "Campinas" },
  ];

  const branchRecords: { id: string; code: string; name: string }[] = [];

  for (const b of branchData) {
    const branch = await db.branch.upsert({
      where: { code: b.code },
      update: { name: b.name },
      create: { code: b.code, name: b.name },
    });
    branchRecords.push({ id: branch.id, code: branch.code, name: branch.name });
    console.log(`Branch ensured: ${branch.code} - ${branch.name}`);
  }

  const branchIds = branchRecords.map((b) => b.id);

  // ── Admin user ──
  const adminEmail = "admin@gmail.com";
  const existing = await db.user.findUnique({ where: { email: adminEmail } });

  const adminPermissions =
    permissionsConst.find((p) => p.role === "ADMIN")?.permissions ?? [];

  if (existing) {
    console.log(`User already exists: ${existing.email}`);
  } else {
    const user = await db.user.create({
      data: {
        name: "Administrador",
        email: adminEmail,
        password: hashedPassword,
        role: "ADMIN",
        permissions: adminPermissions,
        branches: branchIds,
        status: "ACTIVE",
      },
    });
    console.log(
      `Created user: ${user.email} with branches: ${branchIds.join(", ")}`,
    );
  }

  // ── Manager users (3) ──
  const managers = [
    {
      name: "Gerente Rio",
      email: "gerente.rj@gmail.com",
      branches: [branchIds[0]],
    },
    {
      name: "Gerente São Paulo",
      email: "gerente.sp@gmail.com",
      branches: [branchIds[1]],
    },
    {
      name: "Gerente Campinas",
      email: "gerente.cam@gmail.com",
      branches: [branchIds[2]],
    },
  ];

  const managerPermissions =
    permissionsConst.find((p) => p.role === "MANAGER")?.permissions ?? [];

  for (const m of managers) {
    const existingManager = await db.user.findUnique({
      where: { email: m.email },
    });
    if (existingManager) {
      console.log(`Manager already exists: ${existingManager.email}`);
    } else {
      const user = await db.user.create({
        data: {
          name: m.name,
          email: m.email,
          password: hashedPassword,
          role: "MANAGER",
          permissions: managerPermissions,
          branches: m.branches,
          status: "ACTIVE",
        },
      });
      console.log(`Created manager: ${user.email}`);
    }
  }

  // ── Regions (3 per branch) ──
  const regionNames = ["Centro", "Zona Norte", "Zona Sul"];
  const regionMap: Record<string, string[]> = {};

  for (const branch of branchRecords) {
    regionMap[branch.id] = [];
    for (const rName of regionNames) {
      const fullName = `${rName} - ${branch.code}`;
      const existingRegion = await db.region.findFirst({
        where: { name: fullName, branchId: branch.id },
      });
      if (existingRegion) {
        regionMap[branch.id].push(existingRegion.id);
        console.log(`Region already exists: ${fullName}`);
      } else {
        const region = await db.region.create({
          data: { name: fullName, branchId: branch.id },
        });
        regionMap[branch.id].push(region.id);
        console.log(`Created region: ${fullName}`);
      }
    }
  }

  // ── Groups (3 per branch) ──
  const groupNames = ["Restaurantes", "Farmácias", "Mercados"];
  const groupMap: Record<string, string[]> = {};

  for (const branch of branchRecords) {
    groupMap[branch.id] = [];
    for (const gName of groupNames) {
      const fullName = `${gName} - ${branch.code}`;
      const existingGroup = await db.group.findFirst({
        where: { name: fullName, branchId: branch.id },
      });
      if (existingGroup) {
        groupMap[branch.id].push(existingGroup.id);
        console.log(`Group already exists: ${fullName}`);
      } else {
        const group = await db.group.create({
          data: { name: fullName, branchId: branch.id },
        });
        groupMap[branch.id].push(group.id);
        console.log(`Created group: ${fullName}`);
      }
    }
  }

  // ── Deliverymen (3 per branch) ──
  const deliverymenData = [
    {
      name: "Carlos Silva",
      document: "12345678901",
      phone: "21999990001",
      pixKey: "carlos@pix.com",
    },
    {
      name: "Pedro Santos",
      document: "12345678902",
      phone: "21999990002",
      pixKey: "pedro@pix.com",
    },
    {
      name: "Lucas Oliveira",
      document: "12345678903",
      phone: "21999990003",
      pixKey: "lucas@pix.com",
    },
  ];

  for (const branch of branchRecords) {
    const regions = regionMap[branch.id];
    for (let i = 0; i < deliverymenData.length; i++) {
      const d = deliverymenData[i];
      const docWithBranch = `${d.document}${branch.code}`;
      const existingDeliveryman = await db.deliveryman.findFirst({
        where: { document: docWithBranch, branchId: branch.id },
      });
      if (existingDeliveryman) {
        console.log(`Deliveryman already exists: ${d.name} (${branch.code})`);
      } else {
        await db.deliveryman.create({
          data: {
            name: `${d.name} (${branch.code})`,
            document: docWithBranch,
            phone: d.phone,
            contractType: "CLT",
            mainPixKey: `${branch.code.toLowerCase()}.${d.pixKey}`,
            branchId: branch.id,
            regionId: regions[i],
          },
        });
        console.log(`Created deliveryman: ${d.name} (${branch.code})`);
      }
    }
  }

  // ── Clients (3 per branch) ──
  const clientsData = [
    {
      name: "Restaurante Sabor & Arte",
      cnpj: "11222333000101",
      contactName: "Maria Souza",
      contactPhone: "21988880001",
      cep: "20040020",
      street: "Rua da Assembleia",
      number: "100",
      city: "Rio de Janeiro",
      neighborhood: "Centro",
      uf: "RJ",
    },
    {
      name: "Farmácia Saúde Total",
      cnpj: "11222333000102",
      contactName: "João Ferreira",
      contactPhone: "21988880002",
      cep: "20040021",
      street: "Av. Rio Branco",
      number: "200",
      city: "Rio de Janeiro",
      neighborhood: "Centro",
      uf: "RJ",
    },
    {
      name: "Mercado Bom Preço",
      cnpj: "11222333000103",
      contactName: "Ana Costa",
      contactPhone: "21988880003",
      cep: "20040022",
      street: "Rua do Ouvidor",
      number: "300",
      city: "Rio de Janeiro",
      neighborhood: "Centro",
      uf: "RJ",
    },
  ];

  for (const branch of branchRecords) {
    const regions = regionMap[branch.id];
    const groups = groupMap[branch.id];
    for (let i = 0; i < clientsData.length; i++) {
      const c = clientsData[i];
      const cnpjWithBranch = `${c.cnpj}${branch.code}`;
      const existingClient = await db.client.findFirst({
        where: { cnpj: cnpjWithBranch, branchId: branch.id },
      });
      if (existingClient) {
        console.log(`Client already exists: ${c.name} (${branch.code})`);
      } else {
        await db.client.create({
          data: {
            name: `${c.name} (${branch.code})`,
            cnpj: cnpjWithBranch,
            cep: c.cep,
            street: c.street,
            number: c.number,
            city: c.city,
            neighborhood: c.neighborhood,
            uf: c.uf,
            contactName: c.contactName,
            contactPhone: c.contactPhone,
            branchId: branch.id,
            regionId: regions[i],
            groupId: groups[i],
          },
        });
        console.log(`Created client: ${c.name} (${branch.code})`);
      }
    }
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    try {
      await db.$disconnect();
    } catch (_) {
      // ignore
    }
  });
