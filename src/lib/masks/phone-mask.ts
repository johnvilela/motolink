export function phoneMask(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 11);

  if (digits.length === 0) return "";

  const area = digits.slice(0, 2);
  const first = digits.slice(2, 3);
  const middle = digits.slice(3, 7);
  const end = digits.slice(7, 11);

  if (digits.length <= 2) {
    return `(${area}`;
  }

  if (digits.length <= 3) {
    return `(${area}) ${first}`;
  }

  if (digits.length <= 7) {
    return `(${area}) ${first} ${middle}`;
  }

  return `(${area}) ${first} ${middle}-${end}`;
}
