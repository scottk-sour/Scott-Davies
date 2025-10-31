import {
  User,
  Child,
  Story,
  ReadingSession,
  Achievement,
  ChildAchievement,
  Professional,
  TherapeuticNote,
  ConversationGuide,
  SafeguardingLog,
  InstitutionalLicense,
  QuizResult,
  AgeGroup,
  CareStatus,
  Role,
  StoryStatus,
  SubscriptionTier,
  TraumaTopics,
  TherapeuticThemes,
} from '@prisma/client'

// Re-export Prisma enums for convenience
export {
  AgeGroup,
  CareStatus,
  Role,
  StoryStatus,
  SubscriptionTier,
  TraumaTopics,
  TherapeuticThemes,
}

// Extended types with relations
export type UserWithRelations = User & {
  children?: Child[]
  professional?: Professional | null
  subscription?: {
    tier: SubscriptionTier
    stripeCustomerId: string | null
    stripeSubscriptionId: string | null
  } | null
}

export type ChildWithStats = Child & {
  storiesCompleted: number
  achievementsUnlocked: number
  totalReadingTime: number
  favoriteThemes?: string[]
}

export type StoryWithDetails = Story & {
  conversationGuides?: ConversationGuide[]
  playCount: number
  averageRating: number
  completionRate?: number
}

export type ReadingSessionWithDetails = ReadingSession & {
  child: Pick<Child, 'id' | 'name' | 'age' | 'avatar'>
  story: Pick<Story, 'id' | 'title' | 'coverImage' | 'duration'>
}

export type ProfessionalWithVerification = Professional & {
  user: Pick<User, 'id' | 'email' | 'name'>
  totalClients?: number
  activeClients?: number
}

export type TherapeuticNoteWithContext = TherapeuticNote & {
  child: Pick<Child, 'id' | 'name'>
  story?: Pick<Story, 'id' | 'title'> | null
  professional: Pick<Professional, 'id' | 'jobTitle' | 'organization'> & {
    user: Pick<User, 'name'>
  }
}

// Select types for common queries (to ensure type safety)
export const childSelectMinimal = {
  id: true,
  name: true,
  age: true,
  avatar: true,
  ageGroup: true,
} as const

export const storySelectCard = {
  id: true,
  title: true,
  subtitle: true,
  description: true,
  coverImage: true,
  ageGroup: true,
  category: true,
  therapeuticThemes: true,
  duration: true,
  featured: true,
  freeForCareChildren: true,
  slug: true,
  playCount: true,
  averageRating: true,
} as const

export const sessionSelectList = {
  id: true,
  startedAt: true,
  completedAt: true,
  duration: true,
  currentNodeId: true,
  endingReached: true,
  child: {
    select: {
      id: true,
      name: true,
      avatar: true,
    },
  },
  story: {
    select: {
      id: true,
      title: true,
      coverImage: true,
      duration: true,
    },
  },
} as const

// Type helpers for Prisma operations
export type ChildCreateInput = Pick<
  Child,
  'name' | 'age' | 'ageGroup' | 'careStatus'
> & {
  avatar?: string | null
  traumaHistory?: string[]
  triggers?: string[]
  therapeuticGoals?: string[]
}

export type ChildUpdateInput = Partial<ChildCreateInput>

export type StoryCreateInput = Pick<
  Story,
  | 'title'
  | 'description'
  | 'ageGroup'
  | 'category'
  | 'therapeuticThemes'
  | 'duration'
> & {
  subtitle?: string | null
  coverImage?: string
  traumaTopics?: TraumaTopics[]
  contentWarnings?: string[]
  healingGoals?: string[]
  freeForCareChildren?: boolean
  featured?: boolean
  content: unknown // StoryContent JSON
}

export type SessionCreateInput = {
  childId: string
  storyId: string
}

export type SessionUpdateInput = {
  currentNodeId?: string
  choicesMade?: unknown // ChoiceRecord[] as JSON
  nodesVisited?: string[]
  duration?: number
  endingReached?: string | null
  emotionalResponse?: string | null
  helpfulRating?: number | null
}

// Utility types for filters
export type WhereClause<T> = Partial<{
  [K in keyof T]: T[K] | { in: T[K][] } | { contains: string }
}>

// Type guards
export function isChildWithStats(child: Child | ChildWithStats): child is ChildWithStats {
  return 'storiesCompleted' in child
}

export function isStoryWithDetails(story: Story | StoryWithDetails): story is StoryWithDetails {
  return 'playCount' in story
}

export function isSessionWithDetails(
  session: ReadingSession | ReadingSessionWithDetails
): session is ReadingSessionWithDetails {
  return 'child' in session && 'story' in session
}
