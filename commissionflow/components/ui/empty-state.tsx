import { ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description: string
  action?: {
    label: string
    href: string
  }
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex min-h-[400px] items-center justify-center p-8">
      <div className="text-center max-w-md">
        {icon && (
          <div className="mb-4 flex justify-center text-6xl opacity-40">
            {icon}
          </div>
        )}
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-sm text-gray-500 mb-6">{description}</p>
        {action && (
          <Link href={action.href}>
            <Button>{action.label}</Button>
          </Link>
        )}
      </div>
    </div>
  )
}
