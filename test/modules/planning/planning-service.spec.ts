import { beforeEach, describe, expect, it } from "vitest";

process.env.AUTH_SECRET ??= "test-secret";

import { planningPeriodConst } from "../../../src/constants/planning-period";
import { db } from "../../../src/lib/database";
import { planningService } from "../../../src/modules/planning/planning-service";
import type { PlanningUpsertDTO } from "../../../src/modules/planning/planning-types";
import { cleanDatabase } from "../../helpers/clean-database";

// --- Constants -----------------------------------------------------------

const LOGGED_USER_ID = crypto.randomUUID();

const FUTURE_DATE = "2099-01-01";
const PAST_DATE = "2000-01-01";

function toPlanningDateTime(dateOnly: string) {
  return `${dateOnly}T00:00:00.000Z`;
}

const BASE_BODY: PlanningUpsertDTO = {
  clientId: crypto.randomUUID(), // will be overridden in tests
  branchId: crypto.randomUUID(), // will be overridden in tests
  plannedDate: FUTURE_DATE,
  plannedCount: 10,
  period: planningPeriodConst.DAYTIME,
};

// --- Test Data Factories -------------------------------------------------

async function createTestBranch(overrides: { name?: string } = {}) {
  return db.branch.create({
    data: {
      name: overrides.name ?? "Test Branch",
      code: crypto.randomUUID().slice(0, 8),
    },
  });
}

async function createTestClient(
  overrides: { name?: string; cnpj?: string; branchId?: string; groupId?: string; regionId?: string } = {},
) {
  const branchId = overrides.branchId ?? (await createTestBranch()).id;
  return db.client.create({
    data: {
      name: overrides.name ?? "Test Client",
      cnpj: overrides.cnpj ?? "00000000000000",
      cep: "01310100",
      street: "Av. Paulista",
      number: "1000",
      city: "São Paulo",
      neighborhood: "Bela Vista",
      uf: "SP",
      contactName: "Contato Teste",
      branchId,
      groupId: overrides.groupId,
      regionId: overrides.regionId,
      commercialCondition: { create: {} },
    },
  });
}

async function createTestPlanning(
  overrides: {
    clientId?: string;
    branchId?: string;
    plannedDate?: string;
    plannedCount?: number;
    period?: string;
  } = {},
) {
  const branchId = overrides.branchId ?? (await createTestBranch()).id;
  const clientId = overrides.clientId ?? (await createTestClient({ branchId })).id;
  return db.planning.create({
    data: {
      clientId,
      branchId,
      plannedDate: toPlanningDateTime(overrides.plannedDate ?? FUTURE_DATE),
      plannedCount: overrides.plannedCount ?? 10,
      period: overrides.period ?? planningPeriodConst.DAYTIME,
    },
  });
}

// --- Tests ---------------------------------------------------------------

describe("Planning Service", () => {
  const service = planningService();

  beforeEach(async () => {
    await cleanDatabase();
  });

  describe(".upsert", () => {
    it("should create a planning successfully for a future date", async () => {
      const branch = await createTestBranch();
      const client = await createTestClient({ branchId: branch.id });

      const result = await service.upsert({ ...BASE_BODY, clientId: client.id, branchId: branch.id }, LOGGED_USER_ID);

      expect(result.isOk()).toBe(true);

      const planning = result._unsafeUnwrap();
      expect(planning.clientId).toBe(client.id);
      expect(planning.branchId).toBe(branch.id);
      expect(planning.plannedCount).toBe(10);
      expect(planning.period).toBe(planningPeriodConst.DAYTIME);
    });

    it("should return 422 when plannedDate is in the past", async () => {
      const branch = await createTestBranch();
      const client = await createTestClient({ branchId: branch.id });

      const result = await service.upsert(
        { ...BASE_BODY, clientId: client.id, branchId: branch.id, plannedDate: PAST_DATE },
        LOGGED_USER_ID,
      );

      expect(result.isErr()).toBe(true);
      expect(result._unsafeUnwrapErr().statusCode).toBe(422);
    });

    it("should update existing planning when called with the same clientId + plannedDate + period", async () => {
      const branch = await createTestBranch();
      const client = await createTestClient({ branchId: branch.id });

      const body: PlanningUpsertDTO = {
        clientId: client.id,
        branchId: branch.id,
        plannedDate: FUTURE_DATE,
        plannedCount: 5,
        period: planningPeriodConst.DAYTIME,
      };

      await service.upsert(body, LOGGED_USER_ID);

      const result = await service.upsert({ ...body, plannedCount: 20 }, LOGGED_USER_ID);

      expect(result.isOk()).toBe(true);
      expect(result._unsafeUnwrap().plannedCount).toBe(20);

      const total = await db.planning.count({ where: { clientId: client.id } });
      expect(total).toBe(1);
    });
  });

  describe(".getById", () => {
    it("should return the planning when found", async () => {
      const created = await createTestPlanning();

      const result = await service.getById(created.id);

      expect(result.isOk()).toBe(true);
      // biome-ignore lint/style/noNonNullAssertion: Test assertion
      expect(result._unsafeUnwrap()!.id).toBe(created.id);
    });

    it("should return 404 when not found", async () => {
      const result = await service.getById(crypto.randomUUID());

      expect(result.isErr()).toBe(true);
      expect(result._unsafeUnwrapErr().statusCode).toBe(404);
    });
  });

  describe(".listAll", () => {
    it("should return all results in the selected date range", async () => {
      await createTestPlanning({ period: planningPeriodConst.DAYTIME });
      await createTestPlanning({ period: planningPeriodConst.NIGHTTIME });
      await createTestPlanning({ period: "vespertino" });

      const result = await service.listAll({ startAt: FUTURE_DATE });

      expect(result.isOk()).toBe(true);
      const { data } = result._unsafeUnwrap();
      expect(data).toHaveLength(3);
    });

    it("should filter by branchId", async () => {
      const branch1 = await createTestBranch({ name: "Branch 1" });
      const branch2 = await createTestBranch({ name: "Branch 2" });
      const client1 = await createTestClient({ branchId: branch1.id });
      const client2 = await createTestClient({ branchId: branch2.id });

      await createTestPlanning({ clientId: client1.id, branchId: branch1.id });
      await createTestPlanning({ clientId: client2.id, branchId: branch2.id });

      const result = await service.listAll({ startAt: FUTURE_DATE, branchId: branch1.id });

      expect(result.isOk()).toBe(true);
      const { data } = result._unsafeUnwrap();
      expect(data).toHaveLength(1);
      expect(data[0].branchId).toBe(branch1.id);
    });

    it("should filter by clientId", async () => {
      const client1 = await createTestClient();
      const client2 = await createTestClient();

      await createTestPlanning({ clientId: client1.id });
      await createTestPlanning({ clientId: client2.id });

      const result = await service.listAll({ startAt: FUTURE_DATE, clientId: client1.id });

      expect(result.isOk()).toBe(true);
      const { data } = result._unsafeUnwrap();
      expect(data).toHaveLength(1);
      expect(data[0].clientId).toBe(client1.id);
    });

    it("should filter by date range (startAt and endAt)", async () => {
      await createTestPlanning({ plannedDate: "2099-03-01" });
      await createTestPlanning({ plannedDate: "2099-06-15" });
      await createTestPlanning({ plannedDate: "2099-12-01" });

      const result = await service.listAll({
        startAt: "2099-04-01",
        endAt: "2099-09-30",
      });

      expect(result.isOk()).toBe(true);
      const { data } = result._unsafeUnwrap();
      expect(data).toHaveLength(1);
      expect(data[0].plannedDate).toBe("2099-06-15");
    });
  });
});
