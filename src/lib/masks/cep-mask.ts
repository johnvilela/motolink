export function cepMask(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 8);

  if (digits.length === 0) return "";

  const part1 = digits.slice(0, 5);
  const part2 = digits.slice(5, 8);

  if (digits.length <= 5) {
    return part1;
  }

  return `${part1}-${part2}`;
}
