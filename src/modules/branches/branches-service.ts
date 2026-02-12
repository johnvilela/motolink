import { db } from "@/lib/database";

export function branchesService() {
  return {
    getAll() {
      return db.branch.findMany();
    },
    getByIds(ids: string[]) {
      return db.branch.findMany({
        where: { id: { in: ids } },
      });
    },
  };
}
