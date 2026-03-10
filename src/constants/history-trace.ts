export const historyTraceActionConst = {
  CREATED: "CREATED",
  UPDATED: "UPDATED",
  DELETED: "DELETED",
} as const;

export const historyTraceActionsArr = Object.values(historyTraceActionConst);

export const historyTraceEntityConst = {
  USER: "USER",
  SESSION: "SESSION",
  REGION: "REGION",
  GROUP: "GROUP",
  DELIVERYMAN: "DELIVERYMAN",
  CLIENT: "CLIENT",
} as const;

export const historyTraceEntitiesArr = Object.values(historyTraceEntityConst);
