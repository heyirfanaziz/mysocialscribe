import { createClient } from '@/db/supabase/client'
import { SaveDownloadRecord, UserDownload } from '@/types/DownlodsType'

/**
 * Save the download record
 **/
export const saveDownloadRecord = async ({ userId, url, filename }: SaveDownloadRecord) => {
  const supabase = createClient()

  const { error: updateError } = await supabase.from('downloads').insert({
    user_id: userId,
    space_url: url,
    filename,
  })
  if (updateError) throw updateError

  console.log('Download record saved successfully', url, filename)
}

/**
 * Get the most recent downloads (48 hours)
 **/
export async function getRecentDownloads() {
  const supabase = createClient()

  const { data: oldDownloads, error } = await supabase.rpc('get_recent_downloads')
  if (error) throw error

  return oldDownloads as UserDownload[]
}

/**
 * Delete a download file name from the dl record
 **/
export async function updateDownloadFilename(id: string) {
  const supabase = createClient()
  return supabase.from('downloads').update({ filename: null }).eq('id', id)
}

/**
 * Get the user downloads
 **/
export async function getUserDownloads(userId: string) {
  const supabase = createClient()

  if (!userId) return []

  const { data: userDownloads, error } = await supabase
    .from('downloads')
    .select('*')
    .eq('user_id', userId)
  if (error) throw error

  return userDownloads as UserDownload[]
}
