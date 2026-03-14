import { beforeEach, describe, expect, it } from "vitest";

process.env.AUTH_SECRET ??= "test-secret";

import { planningPeriodConst } from "../../../src/constants/planning-period";
import { db } from "../../../src/lib/database";
import { monitoringService } from "../../../src/modules/monitoring/monitoring-service";
import { monitoringQuerySchema } from "../../../src/modules/monitoring/monitoring-types";
import { cleanDatabase } from "../../helpers/clean-database";

const TARGET_DATE = "2099-06-15";
const OTHER_DATE = "2099-06-16";
const START_TIME = new Date("2099-06-15T08:00:00Z");
const END_TIME = new Date("2099-06-15T18:00:00Z");

function toMonitoringDateTime(dateOnly: string) {
  return `${dateOnly}T00:00:00.000Z`;
}

async function createTestBranch(overrides: { name?: string } = {}) {
  return db.branch.create({
    data: {
      name: overrides.name ?? "Test Branch",
      code: crypto.randomUUID().slice(0, 8),
    },
  });
}

async function createTestGroup(overrides: { name?: string; branchId?: string } = {}) {
  const branchId = overrides.branchId ?? (await createTestBranch()).id;

  return db.group.create({
    data: {
      name: overrides.name ?? "Test Group",
      branchId,
    },
  });
}

async function createTestClient(
  overrides: { name?: string; branchId?: string; groupId?: string; provideMeal?: boolean; isDeleted?: boolean } = {},
) {
  const branchId = overrides.branchId ?? (await createTestBranch()).id;

  return db.client.create({
    data: {
      name: overrides.name ?? "Test Client",
      cnpj: crypto.randomUUID().replaceAll("-", "").slice(0, 14),
      cep: "01310100",
      street: "Av. Paulista",
      number: "1000",
      city: "São Paulo",
      neighborhood: "Bela Vista",
      uf: "SP",
      contactName: "Contato Teste",
      branchId,
      groupId: overrides.groupId,
      provideMeal: overrides.provideMeal ?? false,
      isDeleted: overrides.isDeleted ?? false,
      commercialCondition: {
        create: {
          clientDailyDay: 12.5,
        },
      },
    },
    include: {
      commercialCondition: true,
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
      plannedDate: toMonitoringDateTime(overrides.plannedDate ?? TARGET_DATE),
      plannedCount: overrides.plannedCount ?? 10,
      period: overrides.period ?? planningPeriodConst.DAYTIME,
    },
  });
}

async function createTestWorkShiftSlot(
  overrides: { clientId?: string; shiftDate?: string; deliverymanId?: string; deliverymenPaymentValue?: string } = {},
) {
  const clientId = overrides.clientId ?? (await createTestClient()).id;

  return db.workShiftSlot.create({
    data: {
      clientId,
      deliverymanId: overrides.deliverymanId,
      status: "OPEN",
      contractType: "CLT",
      shiftDate: toMonitoringDateTime(overrides.shiftDate ?? TARGET_DATE),
      startTime: START_TIME,
      endTime: END_TIME,
      period: ["daytime"],
      auditStatus: "PENDING",
      deliverymenPaymentValue: overrides.deliverymenPaymentValue ?? "100.50",
    },
  });
}

describe("Monitoring Service", () => {
  const service = monitoringService();

  beforeEach(async () => {
    await cleanDatabase();
  });

  describe(".getDaily", () => {
    it("should return one client with nested planning and work shifts when filtered by clientId", async () => {
      const branch = await createTestBranch();
      const client = await createTestClient({
        branchId: branch.id,
        name: "Client A",
        provideMeal: true,
      });

      await createTestPlanning({
        clientId: client.id,
        branchId: branch.id,
        plannedDate: TARGET_DATE,
        plannedCount: 12,
        period: planningPeriodConst.DAYTIME,
      });
      await createTestPlanning({
        clientId: client.id,
        branchId: branch.id,
        plannedDate: TARGET_DATE,
        plannedCount: 8,
        period: planningPeriodConst.NIGHTTIME,
      });
      await createTestPlanning({
        clientId: client.id,
        branchId: branch.id,
        plannedDate: OTHER_DATE,
        plannedCount: 99,
        period: planningPeriodConst.DAYTIME,
      });

      await createTestWorkShiftSlot({
        clientId: client.id,
        shiftDate: TARGET_DATE,
        deliverymenPaymentValue: "150.75",
      });
      await createTestWorkShiftSlot({
        clientId: client.id,
        shiftDate: OTHER_DATE,
        deliverymenPaymentValue: "999.00",
      });

      const result = await service.getDaily({
        branchId: branch.id,
        clientId: client.id,
        targetDate: TARGET_DATE,
      });

      expect(result.isOk()).toBe(true);

      const payload = result._unsafeUnwrap();
      expect(payload.clients).toHaveLength(1);
      expect(payload.clients[0].id).toBe(client.id);
      expect(payload.clients[0].provideMeal).toBe(true);
      expect(payload.clients[0].planned).toHaveLength(2);
      expect(payload.clients[0].workShifts).toHaveLength(1);
      expect(payload.clients[0].planned.map((item) => item.plannedCount)).toEqual([12, 8]);
      expect(payload.clients[0].commercialCondition?.clientDailyDay).toBe(12.5);
      expect(payload.clients[0].workShifts[0].deliverymenPaymentValue).toBe("150.75");
    });

    it("should return clients from the selected group with nested data only for the target date", async () => {
      const branch = await createTestBranch();
      const group = await createTestGroup({ branchId: branch.id });
      const otherGroup = await createTestGroup({ branchId: branch.id, name: "Other Group" });
      const clientFromGroup = await createTestClient({ branchId: branch.id, groupId: group.id, name: "Client 1" });
      const anotherClientFromGroup = await createTestClient({
        branchId: branch.id,
        groupId: group.id,
        name: "Client 2",
      });
      await createTestClient({ branchId: branch.id, groupId: otherGroup.id, name: "Other Client" });
      await createTestClient({ branchId: branch.id, groupId: group.id, name: "Deleted Client", isDeleted: true });

      await createTestPlanning({
        clientId: clientFromGroup.id,
        branchId: branch.id,
        plannedDate: TARGET_DATE,
        plannedCount: 5,
      });
      await createTestPlanning({
        clientId: anotherClientFromGroup.id,
        branchId: branch.id,
        plannedDate: TARGET_DATE,
        plannedCount: 7,
      });
      await createTestWorkShiftSlot({ clientId: anotherClientFromGroup.id, shiftDate: TARGET_DATE });

      const result = await service.getDaily({
        branchId: branch.id,
        groupId: group.id,
        targetDate: TARGET_DATE,
      });

      expect(result.isOk()).toBe(true);

      const payload = result._unsafeUnwrap();
      expect(payload.clients).toHaveLength(2);
      expect(payload.clients.map((item) => item.id).sort()).toEqual(
        [anotherClientFromGroup.id, clientFromGroup.id].sort(),
      );
      expect(payload.clients.find((item) => item.id === clientFromGroup.id)?.planned).toHaveLength(1);
      expect(payload.clients.find((item) => item.id === clientFromGroup.id)?.workShifts).toHaveLength(0);
      expect(payload.clients.find((item) => item.id === anotherClientFromGroup.id)?.planned).toHaveLength(1);
      expect(payload.clients.find((item) => item.id === anotherClientFromGroup.id)?.workShifts).toHaveLength(1);
    });

    it("should return an empty clients array when the filter matches no active clients", async () => {
      const branch = await createTestBranch();

      const result = await service.getDaily({
        branchId: branch.id,
        clientId: crypto.randomUUID(),
        targetDate: TARGET_DATE,
      });

      expect(result.isOk()).toBe(true);
      expect(result._unsafeUnwrap()).toEqual({ clients: [] });
    });
  });

  describe("monitoringQuerySchema", () => {
    it("should require exactly one of clientId or groupId", () => {
      const emptyResult = monitoringQuerySchema.safeParse({ targetDate: TARGET_DATE });
      const bothResult = monitoringQuerySchema.safeParse({
        clientId: crypto.randomUUID(),
        groupId: crypto.randomUUID(),
        targetDate: TARGET_DATE,
      });

      expect(emptyResult.success).toBe(false);
      expect(bothResult.success).toBe(false);
    });
  });
});
