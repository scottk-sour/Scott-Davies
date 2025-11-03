import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const isDevelopment = process.env.NODE_ENV === 'development'
export const isProduction = process.env.NODE_ENV === 'production'

export function formatPhoneNumber(phone: string): string {
  // Convert UK phone numbers to E.164 format
  let cleaned = phone.replace(/\D/g, '')

  // If starts with 0, replace with +44
  if (cleaned.startsWith('0')) {
    cleaned = '44' + cleaned.slice(1)
  }

  // Add + if not present
  if (!cleaned.startsWith('+')) {
    cleaned = '+' + cleaned
  }

  return cleaned
}

export function formatPostcode(postcode: string): string {
  // Format UK postcode correctly (e.g., "SW1A1AA" -> "SW1A 1AA")
  const cleaned = postcode.replace(/\s/g, '').toUpperCase()
  if (cleaned.length < 5) return cleaned

  const outward = cleaned.slice(0, -3)
  const inward = cleaned.slice(-3)
  return `${outward} ${inward}`
}
