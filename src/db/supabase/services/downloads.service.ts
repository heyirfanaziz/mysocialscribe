'use server'

import { createClient } from '@/db/supabase/client'
import { CreateDlType, DlType, UpdateDlType } from '@/types/DownlodsType'

const supabase = createClient()

/**
 * Create a new download record in the database
 */
export const createDownloadRecord = async ({
  user_id,
  space_url,
}: CreateDlType): Promise<DlType> => {
  const { data, error } = await supabase
    .from('downloads')
    .insert({
      user_id: user_id,
      space_url: space_url,
      status: 'pending',
      is_deleted: false,
    })
    .select()

  if (error) {
    console.error('Error creating download record:', error)
    throw error
  }

  return data[0] as DlType
}

/**
 * Re-download the download record in the database
 */
export const reDownloadRecord = async ({ id }: { id: string }): Promise<DlType> => {
  const { data, error } = await supabase
    .from('downloads')
    .update({
      status: 'pending',
      is_deleted: false,
      is_archived: false,
    })
    .eq('id', id)
    .select()

  if (error) {
    console.error('Error re-downloading download record:', error)
    throw error
  }

  return data[0] as DlType
}

/**
 * Update the download record in the database
 */
export const updateDownloadRecord = async ({ id, filename }: UpdateDlType) => {
  const { error } = await supabase
    .from('downloads')
    .update({
      filename,
      status: 'completed',
    })
    .eq('id', id)

  if (error) {
    console.error('Error updating download record:', error)
    throw error
  }
}

/**
 * Get all download records for a user
 */
export const getDownloads = async ({ userId }: { userId: string }): Promise<DlType[]> => {
  const { data, error } = await supabase
    .from('downloads')
    .select('*')
    .eq('user_id', userId)
    .eq('is_archived', false)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error getting downloads:', error)
    throw error
  }

  return data as DlType[]
}

/**
 * Get all recent download records
 */
export const getRecentDownloads = async (): Promise<DlType[]> => {
  const { data, error } = await supabase.rpc('get_recent_downloads')

  if (error) {
    console.error('Error getting recent downloads:', error)
    throw error
  }

  return data as DlType[]
}

/**
 * Get a download record by id
 */
export const getDownloadById = async ({ id }: { id: string }): Promise<DlType> => {
  const { data, error } = await supabase.from('downloads').select('*').eq('id', id)

  if (error) {
    console.error('Error getting download by id:', error)
    throw error
  }

  return data[0] as DlType
}

/**
 * delete a download record (soft delete)
 */
export const softDeleteDownload = async (id: string) => {
  const { error } = await supabase
    .from('downloads')
    .update({
      is_deleted: true,
      filename: null,
    })
    .eq('id', id)

  if (error) {
    console.error('Error soft deleting download:', error)
    throw error
  }
}

/**
 * delete a download record (hard delete)
 */
export const hardDeleteDownload = async (id: string) => {
  const { error } = await supabase
    .from('downloads')
    .update({
      is_archived: true,
      is_deleted: true,
      filename: null,
    })
    .eq('id', id)

  if (error) {
    console.error('Error hard deleting download:', error)
    throw error
  }
}

/**
 * delete cached download from the server
 */
export const removeCachedDownload = async (id: string) => {
  await supabase
    .from('downloads')
    .update({
      filename: null,
      is_deleted: true,
    })
    .eq('id', id)
}
