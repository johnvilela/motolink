export function cleanMask(value: string) {
  return value.replace(/[^a-zA-Z0-9]/g, "");
}
