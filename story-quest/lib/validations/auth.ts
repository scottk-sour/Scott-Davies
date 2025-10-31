import { z } from 'zod'

export const signupSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  name: z.string().min(1, 'Name is required'),
  role: z.enum(['PARENT', 'PROFESSIONAL']),
})

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
})

export const professionalDetailsSchema = z.object({
  jobTitle: z.string().min(1, 'Job title is required'),
  organization: z.string().min(1, 'Organization is required'),
  dbsCheckNumber: z.string().optional(),
  dbsCheckDate: z.string().optional(),
  qualifications: z.array(z.string()).optional(),
})

export type SignupInput = z.infer<typeof signupSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type ProfessionalDetailsInput = z.infer<typeof professionalDetailsSchema>
