'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { VoiceRecorder } from '@/components/mobile/VoiceRecorder'
import { PhotoUpload } from '@/components/mobile/PhotoUpload'
import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function NewViewingPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    // Property
    propertyAddress: '',
    postcode: '',
    vendorName: '',
    vendorEmail: '',
    vendorPhone: '',

    // Viewer
    viewerName: '',
    viewerEmail: '',
    viewerPhone: '',
    viewingDate: new Date().toISOString().slice(0, 16),

    // Ratings
    interestLevel: 3,
    financialPosition: 3,
    seriousness: 3,

    // Notes
    notes: '',
    feedbackPositive: '',
    feedbackNegative: '',
  })
  const [photos, setPhotos] = useState<File[]>([])

  const RatingInput = ({
    label,
    value,
    onChange,
  }: {
    label: string
    value: number
    onChange: (value: number) => void
  }) => (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((rating) => (
          <button
            key={rating}
            type="button"
            onClick={() => onChange(rating)}
            className={cn(
              'flex h-12 w-12 items-center justify-center rounded-lg border-2 transition-all active:scale-95',
              value >= rating
                ? 'border-green-600 bg-green-600 text-white'
                : 'border-gray-300 bg-white text-gray-400'
            )}
          >
            <Star className="h-6 w-6 fill-current" />
          </button>
        ))}
      </div>
      <p className="text-xs text-gray-500">
        {value === 1 && 'Very Low'}
        {value === 2 && 'Low'}
        {value === 3 && 'Medium'}
        {value === 4 && 'High'}
        {value === 5 && 'Very High'}
      </p>
    </div>
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Create viewing
      const viewingResponse = await fetch('/api/viewings/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!viewingResponse.ok) {
        throw new Error('Failed to create viewing')
      }

      const { viewingId } = await viewingResponse.json()

      // Upload photos if any
      if (photos.length > 0) {
        const photoFormData = new FormData()
        photos.forEach((photo) => photoFormData.append('photos', photo))

        await fetch(`/api/viewings/${viewingId}/photos`, {
          method: 'POST',
          body: photoFormData,
        })
      }

      // Generate and send report
      await fetch('/api/reports/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ viewingId }),
      })

      router.push('/history')
    } catch (error) {
      console.error('Error creating viewing:', error)
      alert('Failed to create viewing. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4 p-4">
      <h1 className="text-2xl font-bold">New Viewing Report</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Step 1: Property & Vendor Details */}
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Property Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="propertyAddress">Property Address</Label>
                <Input
                  id="propertyAddress"
                  value={formData.propertyAddress}
                  onChange={(e) =>
                    setFormData({ ...formData, propertyAddress: e.target.value })
                  }
                  placeholder="123 High Street"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="postcode">Postcode</Label>
                <Input
                  id="postcode"
                  value={formData.postcode}
                  onChange={(e) =>
                    setFormData({ ...formData, postcode: e.target.value.toUpperCase() })
                  }
                  placeholder="SW1A 1AA"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="vendorName">Vendor Name</Label>
                <Input
                  id="vendorName"
                  value={formData.vendorName}
                  onChange={(e) =>
                    setFormData({ ...formData, vendorName: e.target.value })
                  }
                  placeholder="John Smith"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="vendorEmail">Vendor Email</Label>
                <Input
                  id="vendorEmail"
                  type="email"
                  value={formData.vendorEmail}
                  onChange={(e) =>
                    setFormData({ ...formData, vendorEmail: e.target.value })
                  }
                  placeholder="vendor@example.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="vendorPhone">Vendor Phone</Label>
                <Input
                  id="vendorPhone"
                  type="tel"
                  value={formData.vendorPhone}
                  onChange={(e) =>
                    setFormData({ ...formData, vendorPhone: e.target.value })
                  }
                  placeholder="+44 7700 900000"
                />
              </div>

              <Button type="button" onClick={() => setStep(2)} className="w-full" size="lg">
                Next: Viewer Details
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Viewer Details & Ratings */}
        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>Viewer Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="viewerName">Viewer Name</Label>
                <Input
                  id="viewerName"
                  value={formData.viewerName}
                  onChange={(e) =>
                    setFormData({ ...formData, viewerName: e.target.value })
                  }
                  placeholder="Jane Doe"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="viewerEmail">Viewer Email</Label>
                <Input
                  id="viewerEmail"
                  type="email"
                  value={formData.viewerEmail}
                  onChange={(e) =>
                    setFormData({ ...formData, viewerEmail: e.target.value })
                  }
                  placeholder="viewer@example.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="viewerPhone">Viewer Phone</Label>
                <Input
                  id="viewerPhone"
                  type="tel"
                  value={formData.viewerPhone}
                  onChange={(e) =>
                    setFormData({ ...formData, viewerPhone: e.target.value })
                  }
                  placeholder="+44 7700 900000"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="viewingDate">Viewing Date & Time</Label>
                <Input
                  id="viewingDate"
                  type="datetime-local"
                  value={formData.viewingDate}
                  onChange={(e) =>
                    setFormData({ ...formData, viewingDate: e.target.value })
                  }
                  required
                />
              </div>

              <RatingInput
                label="Interest Level"
                value={formData.interestLevel}
                onChange={(value) =>
                  setFormData({ ...formData, interestLevel: value })
                }
              />

              <RatingInput
                label="Financial Position"
                value={formData.financialPosition}
                onChange={(value) =>
                  setFormData({ ...formData, financialPosition: value })
                }
              />

              <RatingInput
                label="Seriousness"
                value={formData.seriousness}
                onChange={(value) =>
                  setFormData({ ...formData, seriousness: value })
                }
              />

              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => setStep(1)} className="flex-1">
                  Back
                </Button>
                <Button type="button" onClick={() => setStep(3)} className="flex-1">
                  Next: Notes
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Notes & Photos */}
        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle>Notes & Photos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Voice Notes</Label>
                <VoiceRecorder
                  onTranscriptChange={(transcript) =>
                    setFormData({ ...formData, notes: transcript })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="feedbackPositive">What did they like?</Label>
                <textarea
                  id="feedbackPositive"
                  value={formData.feedbackPositive}
                  onChange={(e) =>
                    setFormData({ ...formData, feedbackPositive: e.target.value })
                  }
                  placeholder="Positive feedback..."
                  className="min-h-[100px] w-full rounded-lg border-2 border-gray-300 p-3 text-base focus:border-green-600 focus:outline-none"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="feedbackNegative">Any concerns?</Label>
                <textarea
                  id="feedbackNegative"
                  value={formData.feedbackNegative}
                  onChange={(e) =>
                    setFormData({ ...formData, feedbackNegative: e.target.value })
                  }
                  placeholder="Concerns raised..."
                  className="min-h-[100px] w-full rounded-lg border-2 border-gray-300 p-3 text-base focus:border-green-600 focus:outline-none"
                />
              </div>

              <PhotoUpload
                maxPhotos={10}
                onPhotosChange={setPhotos}
              />

              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => setStep(2)} className="flex-1">
                  Back
                </Button>
                <Button type="submit" className="flex-1" size="lg" disabled={loading}>
                  {loading ? 'Generating Report...' : 'Generate Report'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </form>
    </div>
  )
}
