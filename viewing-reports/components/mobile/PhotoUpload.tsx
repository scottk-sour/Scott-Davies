'use client'

import { useState, useRef } from 'react'
import { Camera, X, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import Image from 'next/image'

interface PhotoUploadProps {
  maxPhotos?: number
  onPhotosChange: (photos: File[]) => void
  className?: string
}

export function PhotoUpload({
  maxPhotos = 10,
  onPhotosChange,
  className,
}: PhotoUploadProps) {
  const [photos, setPhotos] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const remaining = maxPhotos - photos.length
    const newFiles = files.slice(0, remaining)

    if (newFiles.length > 0) {
      const updatedPhotos = [...photos, ...newFiles]
      setPhotos(updatedPhotos)
      onPhotosChange(updatedPhotos)

      // Create previews
      newFiles.forEach((file) => {
        const reader = new FileReader()
        reader.onloadend = () => {
          setPreviews((prev) => [...prev, reader.result as string])
        }
        reader.readAsDataURL(file)
      })
    }
  }

  const removePhoto = (index: number) => {
    const updatedPhotos = photos.filter((_, i) => i !== index)
    const updatedPreviews = previews.filter((_, i) => i !== index)
    setPhotos(updatedPhotos)
    setPreviews(updatedPreviews)
    onPhotosChange(updatedPhotos)
  }

  const openCamera = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  return (
    <div className={cn('space-y-4', className)}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />

      {photos.length < maxPhotos && (
        <div className="grid grid-cols-2 gap-3">
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={openCamera}
            className="h-24"
          >
            <div className="flex flex-col items-center gap-2">
              <Camera className="h-6 w-6" />
              <span className="text-xs">Take Photo</span>
            </div>
          </Button>

          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={() => {
              if (fileInputRef.current) {
                fileInputRef.current.removeAttribute('capture')
                fileInputRef.current.click()
              }
            }}
            className="h-24"
          >
            <div className="flex flex-col items-center gap-2">
              <Upload className="h-6 w-6" />
              <span className="text-xs">Upload</span>
            </div>
          </Button>
        </div>
      )}

      {previews.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">
            Photos ({photos.length}/{maxPhotos})
          </p>
          <div className="grid grid-cols-3 gap-2">
            {previews.map((preview, index) => (
              <div key={index} className="relative aspect-square">
                <Image
                  src={preview}
                  alt={`Photo ${index + 1}`}
                  fill
                  className="rounded-lg object-cover"
                />
                <button
                  type="button"
                  onClick={() => removePhoto(index)}
                  className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-red-600 text-white shadow-lg"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
