export const paymentForms = {
  DAILY: "DAILY",
  GUARANTEED_QTY: "GUARANTEED_QTY",
  DAILY_AND_GUARANTEED_QTY: "DAILY_AND_GUARANTEED_QTY",
} as const;

export type PaymentForm = (typeof paymentForms)[keyof typeof paymentForms];

export const paymentFormLabels: Record<PaymentForm, string> = {
  DAILY: "Diária",
  GUARANTEED_QTY: "Qtd Garantida",
  DAILY_AND_GUARANTEED_QTY: "Diária + Qtd Garantida",
};

export const clientWorkShifts = {
  WEEKDAY_DAY: "WEEKDAY_DAY",
  WEEKDAY_NIGHT: "WEEKDAY_NIGHT",
  WEEKEND_DAY: "WEEKEND_DAY",
  WEEKEND_NIGHT: "WEEKEND_NIGHT",
} as const;

export type ClientWorkShift =
  (typeof clientWorkShifts)[keyof typeof clientWorkShifts];

export const clientWorkShiftLabels: Record<ClientWorkShift, string> = {
  WEEKDAY_DAY: "Entrega Garantida durante a semana (Dia)",
  WEEKDAY_NIGHT: "Entrega Garantida durante a semana (Noite)",
  WEEKEND_DAY: "Entrega Garantida fim de semana (Dia)",
  WEEKEND_NIGHT: "Entrega Garantida fim de semana (Noite)",
};
