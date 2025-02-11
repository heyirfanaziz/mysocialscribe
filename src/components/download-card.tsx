import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useState, useEffect } from 'react'
import { getTranscriptionByDownloadId } from '@/db/supabase/services/transcriptions.service'
import { Loader2 } from 'lucide-react'

export function DownloadCard({ download }: { download: DlType }) {
  const [showTranscript, setShowTranscript] = useState(false)
  const [transcript, setTranscript] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  
  const handleViewTranscript = async () => {
    try {
      setIsLoading(true)
      setError('')
      const transcription = await getTranscriptionByDownloadId(download.id)
      const parsedContent = JSON.parse(transcription.content)
      // Format the transcript for display
      const formattedTranscript = Array.isArray(parsedContent) 
        ? parsedContent.map((segment: any) => 
            `[${segment.speaker || 'Speaker'}]: ${segment.text}`
          ).join('\n')
        : parsedContent.text || parsedContent
      setTranscript(formattedTranscript)
      setShowTranscript(true)
    } catch (error) {
      console.error('Failed to load transcript:', error)
      setError('Transcription not available yet. Please try again later.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="rounded-lg border p-4">
      {/* Existing card content */}
      <Button
        onClick={handleViewTranscript}
        variant="outline"
        className="mt-2"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Loading...
          </>
        ) : (
          'View Transcript'
        )}
      </Button>

      <Dialog open={showTranscript} onOpenChange={setShowTranscript}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Transcript</DialogTitle>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-y-auto">
            {error ? (
              <p className="text-red-500">{error}</p>
            ) : (
              <pre className="whitespace-pre-wrap text-sm">{transcript}</pre>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
} 