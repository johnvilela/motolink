export const historyTraceActions = {
  CREATE: "CREATE",
  EDIT: "EDIT",
  DELETE: "DELETE",
} as const;

export type HistoryTraceAction =
  (typeof historyTraceActions)[keyof typeof historyTraceActions];
