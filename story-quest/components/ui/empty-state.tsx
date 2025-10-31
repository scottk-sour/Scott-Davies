import { LucideIcon } from 'lucide-react'
import { Button } from './button'
import { cn } from '@/lib/utils'

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
  secondaryActionLabel?: string
  onSecondaryAction?: () => void
  className?: string
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-12 text-center',
        className
      )}
    >
      {Icon && (
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-purple-100">
          <Icon className="h-8 w-8 text-purple-600" />
        </div>
      )}

      <h3 className="mb-2 text-lg font-semibold text-gray-900">{title}</h3>

      <p className="mb-6 max-w-md text-sm text-gray-600">{description}</p>

      {(actionLabel || secondaryActionLabel) && (
        <div className="flex items-center gap-3">
          {actionLabel && onAction && (
            <Button onClick={onAction} size="lg">
              {actionLabel}
            </Button>
          )}
          {secondaryActionLabel && onSecondaryAction && (
            <Button onClick={onSecondaryAction} variant="outline" size="lg">
              {secondaryActionLabel}
            </Button>
          )}
        </div>
      )}
    </div>
  )
}

// Specialized empty states

export function NoChildrenEmptyState({ onAddChild }: { onAddChild: () => void }) {
  return (
    <EmptyState
      title="No children added yet"
      description="Add a child profile to start their therapeutic story journey. You can customize their reading experience based on their age and needs."
      actionLabel="Add Your First Child"
      onAction={onAddChild}
    />
  )
}

export function NoStoriesEmptyState() {
  return (
    <EmptyState
      title="No stories available"
      description="We're working on adding more therapeutic stories. Check back soon for new content!"
    />
  )
}

export function NoSessionsEmptyState({ onBrowseStories }: { onBrowseStories: () => void }) {
  return (
    <EmptyState
      title="No reading sessions yet"
      description="Start reading a story to see your progress here. Our therapeutic stories are designed to help children process difficult experiences in a safe way."
      actionLabel="Browse Stories"
      onAction={onBrowseStories}
    />
  )
}

export function NoAchievementsEmptyState() {
  return (
    <EmptyState
      title="No achievements yet"
      description="Complete stories to unlock achievements! Each story you finish brings you closer to new badges and rewards."
    />
  )
}

export function NoNotesEmptyState({ onAddNote }: { onAddNote: () => void }) {
  return (
    <EmptyState
      title="No therapeutic notes"
      description="Add notes to track observations, insights, or important points about this child's journey."
      actionLabel="Add First Note"
      onAction={onAddNote}
    />
  )
}

export function SearchEmptyState({ query }: { query: string }) {
  return (
    <EmptyState
      title="No results found"
      description={`We couldn't find any stories matching "${query}". Try a different search term or browse all stories.`}
    />
  )
}

export function ErrorEmptyState({ onRetry }: { onRetry?: () => void }) {
  return (
    <EmptyState
      title="Something went wrong"
      description="We couldn't load this content. Please try again or contact support if the problem persists."
      actionLabel={onRetry ? 'Try Again' : undefined}
      onAction={onRetry}
    />
  )
}

// Compact empty state (for smaller spaces)
export function EmptyStateCompact({
  message,
  actionLabel,
  onAction,
}: {
  message: string
  actionLabel?: string
  onAction?: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <p className="mb-4 text-sm text-gray-600">{message}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction} size="sm" variant="outline">
          {actionLabel}
        </Button>
      )}
    </div>
  )
}
