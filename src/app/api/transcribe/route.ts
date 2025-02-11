import { NextRequest, NextResponse } from 'next/server'
import { createTranscription, saveTranscription } from '@/db/supabase/services/transcriptions.service'
import Replicate from "replicate"

export async function POST(req: NextRequest) {
  try {
    const { audioUrl, downloadId } = await req.json()
    console.log('Starting transcription for:', audioUrl)

    const replicate = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN,
    })

    // Use the public URL directly
    const output = await replicate.run(
      "victor-upmeet/whisperx:84d2ad2d6194fe98a17d2b60bef1c7f910c46b2f6fd38996ca457afd9c8abfcb",
      {
        input: {
          audio_file: audioUrl,  // Use the public URL
      vad_onset: 0.5,
      batch_size: 64,
      vad_offset: 0.363,
      diarization: true,
      temperature: 0,
      min_speakers: 1,
      max_speakers: 10,
      debug: true,
      align_output: false,
      language_detection_min_prob: 0,
      language_detection_max_tries: 5,
      huggingface_access_token: process.env.HUGGING_FACE_TOKEN,
        }
      }
    )

    console.log('Transcription output:', output)

    if (output) {
      await saveTranscription(downloadId, JSON.stringify(output))
      return NextResponse.json({ status: 'success', result: output })
    } else {
      console.error('No output from transcription')
      return NextResponse.json({ error: 'Transcription failed - no output' }, { status: 500 })
    }

  } catch (error) {
    console.error('Transcription error:', error)
    return NextResponse.json({ 
      error: error.message || 'Transcription failed',
      details: error.response?.data || error 
    }, { status: 500 })
  }
} 