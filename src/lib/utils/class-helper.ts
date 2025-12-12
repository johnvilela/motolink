import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function classHelper(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
