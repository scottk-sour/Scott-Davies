'use client'

import { Mic, MicOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useVoiceRecording } from '@/hooks/useVoiceRecording'
import { cn } from '@/lib/utils'

interface VoiceRecorderProps {
  onTranscriptChange: (transcript: string) => void
  className?: string
}

export function VoiceRecorder({
  onTranscriptChange,
  className,
}: VoiceRecorderProps) {
  const {
    isRecording,
    transcript,
    isSupported,
    startRecording,
    stopRecording,
    setTranscript,
  } = useVoiceRecording()

  const handleToggle = () => {
    if (isRecording) {
      stopRecording()
    } else {
      startRecording()
    }
  }

  // Update parent component when transcript changes
  React.useEffect(() => {
    onTranscriptChange(transcript)
  }, [transcript, onTranscriptChange])

  if (!isSupported) {
    return (
      <div className="rounded-lg border border-gray-300 bg-gray-50 p-4">
        <p className="text-sm text-gray-600">
          Voice recording is not supported in your browser.
        </p>
      </div>
    )
  }

  return (
    <div className={cn('space-y-3', className)}>
      <Button
        type="button"
        size="lg"
        variant={isRecording ? 'destructive' : 'outline'}
        onClick={handleToggle}
        className="w-full"
      >
        {isRecording ? (
          <>
            <MicOff className="mr-2 h-5 w-5" />
            Stop Recording
          </>
        ) : (
          <>
            <Mic className="mr-2 h-5 w-5" />
            Start Voice Note
          </>
        )}
      </Button>

      {isRecording && (
        <div className="flex items-center justify-center gap-2 text-red-600">
          <div className="h-3 w-3 animate-pulse rounded-full bg-red-600" />
          <span className="text-sm font-medium">Recording...</span>
        </div>
      )}

      {transcript && (
        <div className="rounded-lg border border-gray-300 bg-gray-50 p-4">
          <p className="text-sm text-gray-700">{transcript}</p>
        </div>
      )}
    </div>
  )
}

// Fix React import
import React from 'react'
