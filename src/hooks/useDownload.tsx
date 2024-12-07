'use client'

import { useState } from 'react'

import { toast } from '@/hooks/use-toast'
import { useLoginDialog } from '@/providers/login-dialog-provider'
import { DownloadTwitterSpacesType, UseDownloadType } from '@/types/UseDownloadType'

export const useDownload = (): UseDownloadType => {
  const { openLoginDialog } = useLoginDialog()
  const [error, setError] = useState<string | null>(null)

  const downloadTwitterSpaces = async ({
    url,
    userId,
  }: DownloadTwitterSpacesType): Promise<void> => {
    try {
      const twitterSpacesRegex = /^https?:\/\/(x|twitter)\.com\/[^/]+\/(status|spaces)\/\d+/
      if (!twitterSpacesRegex.test(url)) {
        setError('Invalid Twitter Spaces or Tweet URL')
        throw new Error('Invalid Twitter Spaces or Tweet URL')
      }

      toast({
        variant: 'success',
        title: 'Download Queued',
        description: 'Your download is being processed. Check your email for the link.',
      })

      const response = await fetch('/api/download/twitter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url, userId }),
      })
      if (!response.ok) throw new Error('Download request failed')
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err)

      if (typeof err === 'object' && err !== null && 'message' in err) {
        const message = (err as { message: string }).message
        if (message === 'User must be logged in') {
          openLoginDialog('login')
          return
        }
      }

      toast({
        variant: 'destructive',
        title: 'Download Error',
        description: errorMessage,
      })
    }
  }

  return { error, downloadTwitterSpaces }
}
