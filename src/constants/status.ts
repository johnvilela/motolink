export const statusConst = {
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
  PENDING: "PENDING",
} as const;

export const statusesArr = Object.values(statusConst);
