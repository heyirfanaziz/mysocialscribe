import { createClient } from '@/db/supabase/server'

export const saveTranscription = async (download_id: string, content: string) => {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('downloads')
    .update({ transcription: content })
    .eq('id', download_id)
    .select()
    .single()

  if (error) throw error
  return data
}

export const getTranscriptionByDownloadId = async (download_id: string) => {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('downloads')
    .select('transcription')
    .eq('id', download_id)
    .single()

  if (error) throw error
  
  if (!data?.transcription) {
    throw new Error('No transcription found')
  }

  return data.transcription
} 