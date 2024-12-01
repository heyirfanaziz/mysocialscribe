'use client'

import { LoaderCircle } from 'lucide-react'
import { User } from '@supabase/auth-js'

import useDownload from '@/hooks/useDownload'
import { useLoginDialog } from '@/providers/login-dialog-provider'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

const Download = ({ user }: { user: User | null }) => {
  const { downloading, downloadTwitterSpaces, error } = useDownload()
  const { openLoginDialog } = useLoginDialog()

  const handleDownload = (url: string) => {
    if (user === null) {
      openLoginDialog()
      return
    }

    downloadTwitterSpaces(url)
  }

  return (
    <div className="z-50 flex w-full max-w-md flex-col gap-1 px-4 pb-10 md:px-0">
      <div className="flex h-full w-full flex-col items-center gap-3 md:flex-row">
        <Input
          className="h-12 w-full rounded-xl text-lg opacity-100 dark:bg-zinc-950 md:w-96"
          placeholder="input your twitter space link"
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleDownload(e.currentTarget.value)
          }}
        />

        <Button
          className="h-12 w-full rounded-xl text-sm md:w-fit"
          size="sm"
          disabled={downloading}
          onClick={() => {
            const input = document.querySelector('input') as HTMLInputElement
            handleDownload(input.value)
          }}
        >
          <span>{downloading ? 'Downloading' : 'Download'}</span>
          {downloading && (
            <LoaderCircle className="animate-spin text-white duration-700 dark:text-black" />
          )}
        </Button>
      </div>

      {error && (
        <p className="text-sm text-red-500 dark:text-red-400">
          Invalid Twitter Spaces or Tweet URL
        </p>
      )}
    </div>
  )
}

export default Download
