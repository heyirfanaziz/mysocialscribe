'use server'

import { createClient } from '@/db/supabase/client'
import { CreateDlType, DlType, UpdateDlType } from '@/types/DownlodsType'

const supabase = createClient()

export const createDownloadRecord = async ({ user_id, space_url }: CreateDlType): Promise<DlType> => {
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

export const getDownloads = async ({ userId }: { userId: string }): Promise<DlType[]> => {
  const { data, error } = await supabase
    .from('downloads')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error getting downloads:', error)
    throw error
  }

  return data as DlType[]
}

// export const createDownloadRecord = async ({
//   userId,
//   url,
// }: {
//   userId: string
//   url: string
// }) => {
//   const { data, error } = await supabase.from('downloads').insert({
//     user_id: userId,
//     url,
//     status: 'pending',
//   })
//
//   if (error) {
//     console.error('Error creating download record:', error)
//     throw error
//   }
//
//   return data
// }
//
// export const saveDownloadRecord = async ({
//   userId,
//   url,
//   filename,
// }: {
//   userId: string
//   url: string
//   filename: string
// }) => {
//   const { data, error } = await supabase.from('downloads').upsert({
//     user_id: userId,
//     url,
//     filename,
//   })
//
//   if (error) {
//     console.error('Error saving download record:', error)
//     throw error
//   }
//
//   return data
// }
//
// export const getDownloads = async ({
//   userId,
// }: {
//   userId: string
// }) => {
//   const { data, error } = await supabase.from('downloads').select('*').eq('user_id', userId)
//
//   if (error) {
//     console.error('Error getting downloads:', error)
//     throw error
//   }
//
//   return data
// }
//
// export const deleteDownload = async ({
//   userId,
//   filename,
// }: {
//   userId: string
//   })
// }
