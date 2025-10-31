// Standardized API response types

export interface ApiSuccessResponse<T> {
  success: true
  data: T
}

export interface ApiErrorResponse {
  success: false
  error: {
    message: string
    code?: string
    details?: Record<string, string>
  }
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse

// Pagination types
export interface PaginationParams {
  page: number
  limit: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  limit: number
  totalPages: number
  hasNext: boolean
  hasPrevious: boolean
}

// Filter types for common endpoints
export interface StoryFilters {
  ageGroup?: string
  category?: string
  featured?: boolean
  traumaTopic?: string
  therapeuticTheme?: string
  search?: string
}

export interface ChildFilters {
  ageGroup?: string
  careStatus?: string
}

export interface SessionFilters {
  childId?: string
  storyId?: string
  completed?: boolean
  startDate?: Date
  endDate?: Date
}

// Common API parameter types
export interface GetStoriesParams extends Partial<StoryFilters>, Partial<PaginationParams> {}
export interface GetChildrenParams extends Partial<ChildFilters>, Partial<PaginationParams> {}
export interface GetSessionsParams extends Partial<SessionFilters>, Partial<PaginationParams> {}

// Authentication response types
export interface LoginResponse {
  user: {
    id: string
    email: string
    name: string | null
    role: string
  }
  token?: string
}

export interface SignupResponse {
  user: {
    id: string
    email: string
    name: string
    role: string
  }
}

// Dashboard statistics types
export interface DashboardStats {
  totalChildren: number
  totalStories: number
  storiesCompleted: number
  weeklyProgress: {
    day: string
    sessions: number
  }[]
  recentSessions: {
    id: string
    storyTitle: string
    childName: string
    completedAt: Date | null
    progress: number
  }[]
}

// Professional dashboard types
export interface ProfessionalStats {
  totalClients: number
  activeClients: number
  totalSessions: number
  pendingNotes: number
  upcomingReviews: number
}

// Analytics types
export interface StoryAnalytics {
  storyId: string
  title: string
  totalPlays: number
  completionRate: number
  averageRating: number
  averageDuration: number
  popularChoices: {
    nodeId: string
    choiceId: string
    count: number
  }[]
}

export interface ChildProgress {
  childId: string
  name: string
  totalSessions: number
  completedSessions: number
  achievements: number
  favoriteThemes: string[]
  progressTrend: {
    week: string
    sessions: number
  }[]
}
