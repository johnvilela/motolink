import { beforeEach } from "vitest";
import { resetDb } from "./utils/resetDb";

beforeEach(async () => {
  await resetDb();
});
