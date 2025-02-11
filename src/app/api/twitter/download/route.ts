import { spawn } from 'child_process'
import { NextRequest, NextResponse } from 'next/server'
import path from 'path'
import fs from 'fs'
import { createClient } from '@/db/supabase/server'

import {
  checkIfDownloadExists,
  download,
  updateOrInsertDownload,
} from '@/db/supabase/services/downloads.service'
import { sendDownloadEmail } from '@/utils/sendDownloadEmail'

export async function POST(req: NextRequest): Promise<NextResponse> {
  const { space_url, user_id, email, download_id } = await req.json()

  if (!space_url) {
    console.error('Download request missing URL')
    return NextResponse.json({ error: 'URL is required' }, { status: 400 })
  }

  if (!user_id) {
    console.error('Download request from unauthenticated user')
    return NextResponse.json({ error: 'User must be logged in' }, { status: 401 })
  }

  if (!download_id) {
    const dlExists = await checkIfDownloadExists({ space_url, user_id })
    if (dlExists) {
      return NextResponse.json({ error: 'Download already exists' }, { status: 400 })
    }
  }

  try {
    const supabase = await createClient()
    
    const { dl, startDownloading } = await download({
      space_url,
      user_id,
      download_id,
    })

    if (!startDownloading) {
      const { data: { publicUrl } } = supabase.storage
        .from('space-audio')
        .getPublicUrl(dl.filename!)
        
      await sendDownloadEmail({
        to: email,
        href: publicUrl,
        downloadName: dl.filename!,
      })
      return NextResponse.json({ downloadUrl: publicUrl }, { status: 200 })
    }

    // If we're starting a new download, proceed with the download process
    const filename = `twitter_space_${crypto.randomUUID().slice(0, 8)}.mp3`
    const tempFilePath = path.join('/tmp', filename)

    return new Promise<NextResponse>((resolve) => {
      const ytDlpProcess = spawn(
        'yt-dlp',
        [
          '-o',
          tempFilePath,
          '-f',
          'bestaudio[ext=m4a]',
          '--extract-audio',
          '--audio-format',
          'mp3',
          space_url,
        ],
        { stdio: ['ignore', 'pipe', 'ignore'] }
      )

      ytDlpProcess.stdout.on('data', (chunk) => {
        console.log(chunk.toString())
      })

      ytDlpProcess.on('close', async (code) => {
        if (code === 0) {
          try {
            // 2. Read the temp file
            const fileBuffer = fs.readFileSync(tempFilePath)
            
            // 3. Upload to Supabase
            const { data, error } = await supabase.storage
              .from('space-audio')
              .upload(`${user_id}/${filename}`, fileBuffer, {
                contentType: 'audio/mpeg',
                cacheControl: '3600',
                upsert: false
              })

            if (error) {
              console.error('Supabase upload error:', error)
              throw error
            }

            // 4. Get the public URL
            const { data: { publicUrl } } = supabase.storage
              .from('space-audio')
              .getPublicUrl(`${user_id}/${filename}`)

            // 5. Clean up temp file
            fs.unlinkSync(tempFilePath)

            // 6. Update database, send email, and start transcription
            await updateOrInsertDownload({
              filename: `${user_id}/${filename}`,
              status: 'completed',
              is_deleted: false,
              is_archived: false,
            }, dl.id)

            await sendDownloadEmail({
              to: email,
              href: publicUrl,
              downloadName: filename,
            })

            // Start transcription in background
            const transcribeResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/transcribe`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                audioUrl: publicUrl,
                downloadId: dl.id,
              }),
            }).catch(error => {
              console.error('Failed to start transcription:', error)
              return null
            })

            if (transcribeResponse && !transcribeResponse.ok) {
              const errorText = await transcribeResponse.text()
              console.error('Transcription request failed:', errorText)
            }

            resolve(NextResponse.json({ downloadUrl: publicUrl }, { status: 200 }))
          } catch (error) {
            console.error('Final steps error:', error)
            resolve(NextResponse.json({ error: 'Process failed' }, { status: 500 }))
          }
        } else {
          resolve(NextResponse.json({ error: 'Download failed' }, { status: 502 }))
        }
      })
    })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Download failed' }, { status: 503 })
  }
}
