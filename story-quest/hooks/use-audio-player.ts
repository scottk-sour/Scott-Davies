'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Howl } from 'howler'

export function useAudioPlayer(audioUrl?: string) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [speed, setSpeed] = useState(1.0)
  const [isLoaded, setIsLoaded] = useState(false)
  const soundRef = useRef<Howl | null>(null)
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Load audio when URL changes
  useEffect(() => {
    if (!audioUrl) {
      setIsLoaded(false)
      return
    }

    // Cleanup previous sound
    if (soundRef.current) {
      soundRef.current.unload()
    }

    // Create new Howl instance
    soundRef.current = new Howl({
      src: [audioUrl],
      html5: true,
      preload: true,
      onload: () => {
        setIsLoaded(true)
      },
      onend: () => {
        setIsPlaying(false)
        setProgress(0)
      },
      onplay: () => {
        setIsPlaying(true)
      },
      onpause: () => {
        setIsPlaying(false)
      },
      onloaderror: (id, error) => {
        console.error('Audio load error:', error)
        setIsLoaded(false)
      },
      onplayerror: (id, error) => {
        console.error('Audio play error:', error)
        setIsPlaying(false)
      },
    })

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current)
      }
      if (soundRef.current) {
        soundRef.current.unload()
      }
    }
  }, [audioUrl])

  // Update progress while playing
  useEffect(() => {
    if (isPlaying && soundRef.current) {
      progressIntervalRef.current = setInterval(() => {
        const seek = soundRef.current?.seek() || 0
        const duration = soundRef.current?.duration() || 1
        setProgress((seek / duration) * 100)
      }, 100)
    } else {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current)
      }
    }

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current)
      }
    }
  }, [isPlaying])

  const play = useCallback(() => {
    soundRef.current?.play()
  }, [])

  const pause = useCallback(() => {
    soundRef.current?.pause()
  }, [])

  const stop = useCallback(() => {
    soundRef.current?.stop()
    setProgress(0)
  }, [])

  const changeSpeed = useCallback((newSpeed: number) => {
    soundRef.current?.rate(newSpeed)
    setSpeed(newSpeed)
  }, [])

  const seek = useCallback((percent: number) => {
    const duration = soundRef.current?.duration() || 0
    soundRef.current?.seek(duration * (percent / 100))
    setProgress(percent)
  }, [])

  return {
    play,
    pause,
    stop,
    changeSpeed,
    seek,
    isPlaying,
    isLoaded,
    progress,
    speed,
  }
}
