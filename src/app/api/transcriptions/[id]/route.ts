import { NextRequest, NextResponse } from 'next/server'
import { getTranscriptionByDownloadId } from '@/db/supabase/services/transcriptions.service'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const transcription = await getTranscriptionByDownloadId(params.id)
    console.log('API Transcription:', transcription)
    
    if (!transcription) {
      return NextResponse.json(
        { error: 'Transcription not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(transcription)
  } catch (error) {
    console.error('Failed to fetch transcription:', error)
    return NextResponse.json(
      { error: 'Failed to fetch transcription' },
      { status: 500 }
    )
  }
} 