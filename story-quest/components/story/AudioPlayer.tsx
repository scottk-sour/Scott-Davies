'use client'

import { useAudioPlayer } from '@/hooks/use-audio-player'
import { Button } from '@/components/ui/button'
import { Play, Pause, Volume2 } from 'lucide-react'

interface AudioPlayerProps {
  audioUrl?: string
  autoPlay?: boolean
  onEnded?: () => void
}

export function AudioPlayer({ audioUrl, autoPlay = false, onEnded }: AudioPlayerProps) {
  const { play, pause, changeSpeed, isPlaying, isLoaded, progress, speed } =
    useAudioPlayer(audioUrl)

  // Auto-play when loaded
  if (autoPlay && isLoaded && !isPlaying && audioUrl) {
    play()
  }

  if (!audioUrl) {
    return null
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
      <div className="flex items-center gap-4">
        {/* Play/Pause Button */}
        <Button
          onClick={() => (isPlaying ? pause() : play())}
          disabled={!isLoaded}
          size="icon"
          className="h-12 w-12 rounded-full"
        >
          {isPlaying ? (
            <Pause className="h-5 w-5" />
          ) : (
            <Play className="h-5 w-5 ml-0.5" />
          )}
        </Button>

        {/* Progress Bar */}
        <div className="flex-1">
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-purple-600 transition-all duration-100"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Speed Controls */}
        <div className="flex items-center gap-2">
          <Volume2 className="h-4 w-4 text-gray-600" />
          <select
            value={speed}
            onChange={(e) => changeSpeed(parseFloat(e.target.value))}
            className="text-sm border border-gray-300 rounded px-2 py-1"
          >
            <option value="0.75">0.75x</option>
            <option value="1.0">1.0x</option>
            <option value="1.25">1.25x</option>
            <option value="1.5">1.5x</option>
          </select>
        </div>
      </div>

      {!isLoaded && (
        <p className="text-xs text-gray-500 mt-2">Loading audio...</p>
      )}
    </div>
  )
}
