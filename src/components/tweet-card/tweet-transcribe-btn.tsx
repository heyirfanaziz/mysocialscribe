'use client'

import { useState } from 'react'
import { HiTranslate } from 'react-icons/hi'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

// Define speaker colors
const SPEAKER_COLORS = [
  'text-blue-600 dark:text-blue-400',
  'text-emerald-600 dark:text-emerald-400',
  'text-purple-600 dark:text-purple-400',
  'text-orange-600 dark:text-orange-400',
  'text-pink-600 dark:text-pink-400',
]

interface Segment {
  speaker: string
  text: string
  start: string
  end: string
}

// Helper function to format seconds to MM:SS
const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.floor(seconds % 60)
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
}

const TweetTranscribeBtn = ({ downloadId }: { downloadId: string }) => {
  const [showTranscript, setShowTranscript] = useState(false)
  const [segments, setSegments] = useState<Segment[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleViewTranscript = async () => {
    try {
      setIsLoading(true)
      setError('')
      
      const response = await fetch(`/api/transcriptions/${downloadId}`)
      if (!response.ok) {
        throw new Error('Failed to fetch transcript')
      }
      
      const transcription = await response.json()
      const parsedTranscription = JSON.parse(transcription)

      if (parsedTranscription?.segments) {
        // Create a map to assign sequential numbers to speakers
        const speakerMap = new Map<string, number>()
        let speakerCount = 0

        const formattedSegments = parsedTranscription.segments.map((segment: any) => {
          const rawSpeaker = segment.speaker || 'unknown'
          if (!speakerMap.has(rawSpeaker)) {
            speakerMap.set(rawSpeaker, ++speakerCount)
          }
          return {
            speaker: `0${speakerMap.get(rawSpeaker)}`,  // Adds leading zero
            text: segment.text.trim(),
            start: formatTime(segment.start),
            end: formatTime(segment.end)
          }
        })
        setSegments(formattedSegments)
      } else {
        console.error('Unexpected transcription format:', parsedTranscription)
        setError('Transcription format not supported')
      }
      
      setShowTranscript(true)
    } catch (error) {
      console.error('Failed to load transcript:', error)
      setError('Transcription not available yet. Please try again later.')
    } finally {
      setIsLoading(false)
    }
  }

  const getSpeakerColor = (speaker: string) => {
    const speakerNumber = parseInt(speaker) - 1
    return SPEAKER_COLORS[speakerNumber % SPEAKER_COLORS.length]
  }

  return (
    <>
      <Button
        size="sm"
        variant="ghost"
        className="h-7 w-7 bg-emerald-500 text-stone-50 hover:!bg-emerald-700"
        onClick={handleViewTranscript}
        disabled={isLoading}
      >
        {isLoading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <HiTranslate className="h-5 w-5" />
        )}
      </Button>

      <Dialog open={showTranscript} onOpenChange={setShowTranscript}>
        <DialogContent className="max-w-3xl h-[80vh] flex flex-col p-0">
          <DialogHeader className="px-6 py-4 border-b">
            <DialogTitle className="text-xl font-semibold">
              Transcript
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto px-6 py-4">
            {error ? (
              <p className="text-red-500 text-center py-4">{error}</p>
            ) : (
              <div className="space-y-3">
                {segments.map((segment, index) => (
                  <div 
                    key={index} 
                    className={cn(
                      "group relative rounded-lg p-3 transition-colors",
                      "hover:bg-slate-100 dark:hover:bg-slate-800"
                    )}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className={cn(
                        "font-medium text-sm",
                        getSpeakerColor(segment.speaker)
                      )}>
                        Speaker {segment.speaker}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {segment.start} - {segment.end}
                      </span>
                    </div>
                    <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                      {segment.text}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default TweetTranscribeBtn 