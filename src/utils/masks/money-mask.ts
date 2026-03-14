export function applyMoneyMask(value: string): string {
  const digits = value.replace(/\D/g, "");

  if (!digits) return "";

  const cents = Number(digits).toString();
  const padded = cents.padStart(3, "0");

  const integerPart = padded.slice(0, -2);
  const decimalPart = padded.slice(-2);

  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

  return `R$ ${formattedInteger},${decimalPart}`;
}

export function formatMoneyDisplay(value: string | number | undefined | null): string {
  if (value === null || value === undefined || value === "") return "R$ 0,00";

  const num = typeof value === "string" ? Number.parseFloat(value) : value;
  if (Number.isNaN(num)) return "R$ 0,00";

  const [integerPart, decimalPart = "00"] = Math.abs(num).toFixed(2).split(".");
  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

  return `R$ ${formattedInteger},${decimalPart}`;
}
