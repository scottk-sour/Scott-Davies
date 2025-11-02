'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AudioPlayer } from './AudioPlayer'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowLeft, Home } from 'lucide-react'
import type { StoryContent, StoryNode, ChoiceRecord } from '@/types/story'
import Image from 'next/image'

interface StoryReaderProps {
  storyId: string
  sessionId: string
  content: StoryContent
  audioFiles?: Record<string, string>
  childId: string
  onComplete: (endingId: string) => void
  onExit: () => void
}

export function StoryReader({
  storyId,
  sessionId,
  content,
  audioFiles = {},
  childId,
  onComplete,
  onExit,
}: StoryReaderProps) {
  const [currentNodeId, setCurrentNodeId] = useState<string>('start')
  const [history, setHistory] = useState<string[]>([])
  const [choicesMade, setChoicesMade] = useState<ChoiceRecord[]>([])
  const [nodesVisited, setNodesVisited] = useState<string[]>(['start'])

  const currentNode = [...content.nodes, ...content.endings].find(
    (n) => n.id === currentNodeId
  ) as StoryNode | undefined

  const currentAudio = currentNode?.audio || audioFiles?.[currentNodeId]

  // Save progress periodically
  useEffect(() => {
    const saveProgress = async () => {
      try {
        await fetch(`/api/reading-sessions/${sessionId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            choicesMade,
            nodesVisited,
            currentNodeId,
          }),
        })
      } catch (error) {
        console.error('Failed to save progress:', error)
      }
    }

    const interval = setInterval(saveProgress, 30000) // Save every 30 seconds

    return () => clearInterval(interval)
  }, [sessionId, choicesMade, nodesVisited, currentNodeId])

  const handleChoice = (choiceId: string, nextNodeId: string) => {
    // Record choice
    const newChoice: ChoiceRecord = {
      nodeId: currentNodeId,
      choiceId,
      timestamp: new Date(),
    }

    setChoicesMade([...choicesMade, newChoice])

    // Add current node to history
    setHistory([...history, currentNodeId])

    // Navigate to next node
    setCurrentNodeId(nextNodeId)

    // Track visited nodes
    if (!nodesVisited.includes(nextNodeId)) {
      setNodesVisited([...nodesVisited, nextNodeId])
    }

    // Check if this is an ending
    const isEnding = content.endings.some((e) => e.id === nextNodeId)
    if (isEnding) {
      // Complete the story
      setTimeout(() => {
        handleComplete(nextNodeId)
      }, 2000) // Give time to see the ending
    }
  }

  const handleBack = () => {
    if (history.length === 0) return

    const previousNodeId = history[history.length - 1]
    setHistory(history.slice(0, -1))
    setCurrentNodeId(previousNodeId)

    // Remove last choice
    setChoicesMade(choicesMade.slice(0, -1))
  }

  const handleComplete = async (endingId: string) => {
    try {
      await fetch(`/api/reading-sessions/${sessionId}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endingReached: endingId,
        }),
      })

      onComplete(endingId)
    } catch (error) {
      console.error('Failed to complete session:', error)
    }
  }

  const handleExit = () => {
    if (confirm('Are you sure you want to exit? Your progress will be saved.')) {
      onExit()
    }
  }

  if (!currentNode) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">Loading story...</p>
      </div>
    )
  }

  const isEnding = content.endings.some((e) => e.id === currentNodeId)

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {history.length > 0 && !isEnding && (
              <Button variant="ghost" size="sm" onClick={handleBack}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <div className="text-sm text-gray-600">
              {nodesVisited.length} scenes visited
            </div>
            <Button variant="ghost" size="sm" onClick={handleExit}>
              <Home className="h-4 w-4 mr-2" />
              Exit
            </Button>
          </div>
        </div>
      </div>

      {/* Story Content */}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentNodeId}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
          >
            <Card className="overflow-hidden">
              {/* Scene Image */}
              {currentNode.image && (
                <div className="relative h-64 md:h-96 w-full bg-gray-100">
                  <Image
                    src={currentNode.image}
                    alt="Story scene"
                    fill
                    className="object-cover"
                  />
                </div>
              )}

              <CardContent className="p-8">
                {/* Scene Text */}
                <div
                  className={`story-text text-xl leading-relaxed mb-8 ${
                    isEnding ? 'text-center' : ''
                  }`}
                >
                  {currentNode.text}
                </div>

                {/* Audio Player */}
                {currentAudio && (
                  <div className="mb-8">
                    <AudioPlayer audioUrl={currentAudio} autoPlay={true} />
                  </div>
                )}

                {/* Choices */}
                {currentNode.choices && currentNode.choices.length > 0 && (
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-gray-600 mb-4">
                      What would you like to do?
                    </p>
                    {currentNode.choices.map((choice) => (
                      <motion.button
                        key={choice.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleChoice(choice.id, choice.nextNode)}
                        className="w-full p-4 rounded-xl border-2 border-purple-200 bg-white hover:border-purple-400 hover:bg-purple-50 transition-colors text-left"
                      >
                        <div className="flex items-center gap-3">
                          {choice.icon && (
                            <span className="text-2xl">{choice.icon}</span>
                          )}
                          <span className="text-lg font-medium">{choice.text}</span>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                )}

                {/* Ending */}
                {isEnding && (
                  <div className="text-center mt-8">
                    <div className="inline-block px-6 py-3 bg-purple-100 text-purple-800 rounded-full font-semibold mb-6">
                      🌟 The End 🌟
                    </div>
                    <p className="text-gray-600 mb-6">
                      Great job completing this story!
                    </p>
                    <Button onClick={onExit} size="lg">
                      Finish Story
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
