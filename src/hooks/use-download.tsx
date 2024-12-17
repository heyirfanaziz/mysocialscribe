'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

import { toast } from '@/hooks/use-toast'
import { useLoginDialog } from '@/providers/login-dialog-provider'
import { DownloadTwitterSpacesType, UseDownloadType } from '@/types/UseDownloadType'

export const useDownload = (): UseDownloadType => {
  const { openLoginDialog } = useLoginDialog()
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const downloadTwitterSpaces = async ({
    url,
    userId,
    email,
    redirect,
  }: DownloadTwitterSpacesType): Promise<void> => {
    try {
      const twitterSpacesRegex = /^https?:\/\/(x|twitter)\.com\/[^/]+\/(status|spaces)\/\d+/
      if (!twitterSpacesRegex.test(url)) {
        toast({
          title: 'Invalid Twitter Spaces or Tweet URL',
          description: 'Please enter a valid Twitter Spaces or Tweet URL',
          variant: 'destructive',
        })
        throw new Error('Invalid Twitter Spaces or Tweet URL')
      }

      if (redirect) router.push('/success')

      const normalizedUrl = url.replace(/^https?:\/\/twitter\.com/, 'https://x.com')

      const response = await fetch('/api/twitter/download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: normalizedUrl, userId, email }),
      })
      if (!response.ok && response.status === 500) {
        setError('Download failed, please recheck the URL')
        throw new Error('Download failed, please recheck the URL')
        // todo: fix use `resend`
        // await sendErrorEmail({ to: email })
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err)
      console.warn(errorMessage)

      if (typeof err === 'object' && err !== null && 'message' in err) {
        const message = (err as { message: string }).message
        if (message === 'User must be logged in') {
          openLoginDialog('login')
          return
        }
      }
    }
  }

  return { error, downloadTwitterSpaces }
}
