'use client'

import { useState } from 'react'
import { LoaderCircle } from 'lucide-react'
import { User } from '@supabase/auth-js'

import { useDownload } from '@/hooks/useDownload'
import { useLoginDialog } from '@/providers/login-dialog-provider'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

const Download = ({ user }: { user: User | null }) => {
  // const { downloading, downloadTwitterSpaces, error, progress } = useDownload()
  const { downloading, downloadTwitterSpaces, error } = useDownload()
  const { openLoginDialog } = useLoginDialog()
  const [inputUrl, setInputUrl] = useState('')

  const handleDownload = () => {
    if (user === null) {
      openLoginDialog('login')
      return
    }

    downloadTwitterSpaces(inputUrl)
  }

  return (
    <div className="z-50 flex w-full max-w-md flex-col gap-1 space-y-1 px-4 pb-10 md:px-0">
      <div className="flex h-full w-full flex-col items-center gap-2 md:flex-row">
        <Input
          className="h-10 w-full rounded-xl bg-stone-50 text-base opacity-100 dark:bg-zinc-950 md:h-12 md:w-96 md:text-lg"
          placeholder="Input your Twitter space link"
          value={inputUrl}
          onChange={(e) => setInputUrl(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleDownload()
          }}
        />

        <div className="flex w-full items-center space-x-2 md:w-fit">
          <Button
            className="h-10 w-full min-w-12 rounded-xl text-sm md:h-12 md:w-fit"
            size="sm"
            disabled={downloading || !inputUrl}
            onClick={handleDownload}
          >
            {downloading ? (
              <>
                <span className="block md:hidden">Downloading...</span>
                <LoaderCircle className="animate-spin text-white duration-700 dark:text-black" />
              </>
            ) : (
              <span>Download</span>
            )}
          </Button>
        </div>
      </div>

      {error && <p className="text-sm text-red-500 dark:text-red-400">{error}</p>}

      {/*{downloading && (*/}
      {/*  <div className="flex w-full items-center space-x-2">*/}
      {/*    <Progress*/}
      {/*      value={progress}*/}
      {/*      className="w-full"*/}
      {/*    />*/}
      {/*    <span className="text-sm text-gray-500">{progress}%</span>*/}
      {/*  </div>*/}
      {/*)}*/}

      {/*{progress === 100 && !downloading && (*/}
      {/*  <p className="text-sm text-green-500 dark:text-green-400">*/}
      {/*    Download complete! Check your downloads folder.*/}
      {/*  </p>*/}
      {/*)}*/}
    </div>
  )
}

export default Download
