import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export type UserSession = {
  id: string
  name: string
  username: string
  role: string
  hourly_rate: any
  isActive: string
}
