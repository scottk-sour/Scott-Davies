// Story Content Types

export interface StoryNode {
  id: string
  type: 'scene' | 'ending'
  text: string
  image?: string
  audio?: string
  choices?: StoryChoice[]
  emotionalTone?: 'calm' | 'hopeful' | 'reflective' | 'joyful' | 'serious'
}

export interface StoryChoice {
  id: string
  text: string
  icon?: string
  nextNode: string
  therapeuticNote?: string // Helper for professionals
}

export interface StoryEnding {
  id: string
  text: string
  image?: string
  audio?: string
  achievement?: string
  message?: string // Positive reinforcement message
}

export interface StoryContent {
  nodes: StoryNode[]
  endings: StoryEnding[]
}

export interface ConversationGuide {
  section: 'before' | 'during' | 'after'
  title: string
  questions: string[]
  activities?: string[]
  observations?: string[]
}

// Database Story Type
export interface Story {
  id: string
  title: string
  subtitle?: string
  description: string
  coverImage: string
  ageGroup: string[]
  category: string
  therapeuticThemes: string[]
  traumaTopics: string[]
  contentWarnings: string[]
  healingGoals: string[]
  content: StoryContent
  audioFiles?: Record<string, string>
  conversationGuides?: ConversationGuide[]
  duration: number
  wordCount: number
  author: string
  status: string
  featured: boolean
  freeForCareChildren: boolean
  slug: string
  publishedAt?: Date
  createdAt: Date
}

// Reading Session Types
export interface ReadingSession {
  id: string
  childId: string
  storyId: string
  startedAt: Date
  completedAt?: Date
  duration?: number
  choicesMade: ChoiceRecord[]
  endingReached?: string
  nodesVisited: string[]
  emotionalResponse?: string
  helpfulRating?: number
}

export interface ChoiceRecord {
  nodeId: string
  choiceId: string
  timestamp: Date
}
