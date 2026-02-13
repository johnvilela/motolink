import { db } from "@/lib/database";

export async function resetDb() {
  await db.$executeRawUnsafe(`
    TRUNCATE TABLE
      "users",
      "sessions",
      "verification_tokens",
      "history_traces",
      "branches",
      "groups",
      "regions",
      "deliverymen",
      "clients",
      "commercial_conditions",
      "client_blocks",
      "work_shift_slots",
      "payment_requests",
      "invites",
      "events",
      "plannings"
    RESTART IDENTITY CASCADE;
  `);
}
