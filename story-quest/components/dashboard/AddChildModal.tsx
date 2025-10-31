'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { X } from 'lucide-react'

interface AddChildModalProps {
  onClose: () => void
  onSuccess: () => void
}

export function AddChildModal({ onClose, onSuccess }: AddChildModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    careStatus: 'NOT_IN_CARE',
    localAuthorityRef: '',
    socialWorkerContact: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      const age = parseInt(formData.age)
      const ageGroup = age <= 6 ? 'AGES_4_6' : 'AGES_7_10'

      const response = await fetch('/api/children', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          age,
          ageGroup,
          traumaHistory: [],
          triggers: [],
          therapeuticGoals: [],
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to add child')
      }

      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add child')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Add Child</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm">
              {error}
            </div>
          )}

          <div>
            <Label htmlFor="name">Child's Name *</Label>
            <Input
              id="name"
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Emma"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="age">Age *</Label>
            <Input
              id="age"
              type="number"
              required
              min="1"
              max="18"
              value={formData.age}
              onChange={(e) => setFormData({ ...formData, age: e.target.value })}
              placeholder="e.g., 8"
              className="mt-1"
            />
            <p className="text-xs text-gray-500 mt-1">
              Stories are tailored for ages 4-10
            </p>
          </div>

          <div>
            <Label htmlFor="careStatus">Care Status *</Label>
            <Select
              id="careStatus"
              value={formData.careStatus}
              onChange={(e) =>
                setFormData({ ...formData, careStatus: e.target.value })
              }
              className="mt-1"
            >
              <option value="NOT_IN_CARE">Not in Care</option>
              <option value="FOSTER_CARE">Foster Care</option>
              <option value="KINSHIP_CARE">Kinship Care</option>
              <option value="RESIDENTIAL_CARE">Residential Care</option>
              <option value="ADOPTED_FROM_CARE">Adopted from Care</option>
              <option value="SPECIAL_GUARDIANSHIP">Special Guardianship</option>
            </Select>
            {formData.careStatus !== 'NOT_IN_CARE' && (
              <p className="text-xs text-green-600 mt-1">
                ✓ Eligible for free access (pending verification)
              </p>
            )}
          </div>

          {formData.careStatus !== 'NOT_IN_CARE' && (
            <>
              <div>
                <Label htmlFor="localAuthorityRef">Local Authority Reference</Label>
                <Input
                  id="localAuthorityRef"
                  type="text"
                  value={formData.localAuthorityRef}
                  onChange={(e) =>
                    setFormData({ ...formData, localAuthorityRef: e.target.value })
                  }
                  placeholder="Optional"
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  This helps us verify care status for free access
                </p>
              </div>

              <div>
                <Label htmlFor="socialWorkerContact">Social Worker Contact</Label>
                <Input
                  id="socialWorkerContact"
                  type="text"
                  value={formData.socialWorkerContact}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      socialWorkerContact: e.target.value,
                    })
                  }
                  placeholder="Optional"
                  className="mt-1"
                />
              </div>
            </>
          )}

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-sm">
            <p className="font-medium text-purple-900 mb-1">Privacy & Safety</p>
            <p className="text-purple-700">
              All child information is encrypted and stored securely. Only you can access
              this profile.
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={isSubmitting}>
              {isSubmitting ? 'Adding...' : 'Add Child'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
