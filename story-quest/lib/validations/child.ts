import { z } from 'zod'

export const childSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  age: z.number().int().min(1).max(18),
  ageGroup: z.enum(['AGES_4_6', 'AGES_7_10']),
  avatar: z.string().url().optional().or(z.literal('')),
  careStatus: z.enum([
    'NOT_IN_CARE',
    'FOSTER_CARE',
    'KINSHIP_CARE',
    'RESIDENTIAL_CARE',
    'ADOPTED_FROM_CARE',
    'SPECIAL_GUARDIANSHIP',
  ]),
  traumaHistory: z.array(z.string()).optional().default([]),
  triggers: z.array(z.string()).optional().default([]),
  therapeuticGoals: z.array(z.string()).optional().default([]),
  localAuthorityRef: z.string().optional().or(z.literal('')),
  socialWorkerContact: z.string().optional().or(z.literal('')),
})

export const updateChildSchema = childSchema.partial()

export type ChildInput = z.infer<typeof childSchema>
export type UpdateChildInput = z.infer<typeof updateChildSchema>
