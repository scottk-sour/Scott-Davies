import { z } from 'zod'

// Reading session validation
export const startSessionSchema = z.object({
  childId: z.string(),
  storyId: z.string(),
})

export const updateSessionSchema = z.object({
  choicesMade: z.array(
    z.object({
      nodeId: z.string(),
      choiceId: z.string(),
      timestamp: z.string().or(z.date()),
    })
  ),
  nodesVisited: z.array(z.string()),
  currentNodeId: z.string().optional(),
})

export const completeSessionSchema = z.object({
  endingReached: z.string(),
  emotionalResponse: z.enum(['happy', 'sad', 'confused', 'scared', 'hopeful', 'proud']).optional(),
  helpfulRating: z.number().min(1).max(5).optional(),
})

export type StartSessionInput = z.infer<typeof startSessionSchema>
export type UpdateSessionInput = z.infer<typeof updateSessionSchema>
export type CompleteSessionInput = z.infer<typeof completeSessionSchema>
