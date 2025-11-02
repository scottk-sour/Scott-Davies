'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, User, Edit, Trash2 } from 'lucide-react'
import { AddChildModal } from '@/components/dashboard/AddChildModal'

interface Child {
  id: string
  name: string
  age: number
  ageGroup: string
  careStatus: string
  careStatusVerified: boolean
  storiesCompleted: number
}

export default function ChildrenPage() {
  const [children, setChildren] = useState<Child[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)

  useEffect(() => {
    fetchChildren()
  }, [])

  const fetchChildren = async () => {
    try {
      const response = await fetch('/api/children')
      const data = await response.json()
      setChildren(data.children || [])
    } catch (error) {
      console.error('Failed to fetch children:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleChildAdded = () => {
    fetchChildren()
    setShowAddModal(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this child profile?')) {
      return
    }

    try {
      const response = await fetch(`/api/children/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        fetchChildren()
      } else {
        alert('Failed to delete child')
      }
    } catch (error) {
      console.error('Failed to delete child:', error)
      alert('Failed to delete child')
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-600">Loading...</p>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Children</h1>
          <p className="text-gray-600 mt-1">
            Manage profiles for the children in your care
          </p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Child
        </Button>
      </div>

      {/* Empty State */}
      {children.length === 0 && (
        <Card>
          <CardContent className="pt-12 pb-12 text-center">
            <div className="mx-auto h-16 w-16 rounded-full bg-purple-100 flex items-center justify-center mb-4">
              <User className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No children yet</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Get started by adding a child profile. You'll be able to track their reading
              progress and access age-appropriate stories.
            </p>
            <Button onClick={() => setShowAddModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Child
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Children Grid */}
      {children.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {children.map((child) => (
            <Card key={child.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center text-xl font-bold text-purple-600">
                      {child.name[0].toUpperCase()}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{child.name}</CardTitle>
                      <p className="text-sm text-gray-600">Age {child.age}</p>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Badge variant={child.careStatusVerified ? 'success' : 'warning'}>
                      {formatCareStatus(child.careStatus)}
                    </Badge>
                    {!child.careStatusVerified && (
                      <Badge variant="warning">Unverified</Badge>
                    )}
                  </div>

                  <div className="text-sm text-gray-600">
                    <p>
                      <strong>{child.storiesCompleted}</strong>{' '}
                      {child.storiesCompleted === 1 ? 'story' : 'stories'} completed
                    </p>
                  </div>

                  <div className="flex gap-2 pt-3">
                    <Link href={`/dashboard/children/${child.id}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">
                        View Profile
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(child.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add Child Modal */}
      {showAddModal && (
        <AddChildModal
          onClose={() => setShowAddModal(false)}
          onSuccess={handleChildAdded}
        />
      )}
    </div>
  )
}

function formatCareStatus(status: string): string {
  const statusMap: Record<string, string> = {
    NOT_IN_CARE: 'Not in Care',
    FOSTER_CARE: 'Foster Care',
    KINSHIP_CARE: 'Kinship Care',
    RESIDENTIAL_CARE: 'Residential Care',
    ADOPTED_FROM_CARE: 'Adopted',
    SPECIAL_GUARDIANSHIP: 'Special Guardianship',
  }
  return statusMap[status] || status
}
