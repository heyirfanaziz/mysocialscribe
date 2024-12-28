'use server'

import { createClient } from '@/db/supabase/client'
import { CreateDlType, DlType, UpdateDlType } from '@/types/DownlodsType'
import { Database } from '@/types/supabase'

const supabase = createClient()

type DownloadParams = {
  space_url: string
  user_id: string
  download_id?: string
}

type DownloadResult = {
  dl: Database['public']['Tables']['downloads']['Row']
  startDownloading: boolean
}

export const findDlBySpaceUrl = async (space_url: string): Promise<DlType | undefined> => {
  const { data: record } = await supabase
    .from('downloads')
    .select('*')
    .eq('space_url', space_url)
    .select()

  if (record) return record[0] ? record[0] : null
}

export async function updateOrInsertDownload(
  data: Partial<Database['public']['Tables']['downloads']['Insert']>,
  download_id?: string
): Promise<DownloadResult['dl']> {
  const { data: result, error } = download_id
    ? await supabase.from('downloads').update(data).eq('id', download_id).select().single()
    : await supabase.from('downloads').insert(data).select().single()

  if (error) {
    console.error('Error updating/inserting download record:', error)
    throw error
  }

  return result
}

export const download = async ({
  space_url,
  user_id,
  download_id,
}: DownloadParams): Promise<DownloadResult> => {
  const existingDownload = await findDlBySpaceUrl(space_url)

  if (existingDownload?.filename) {
    const data = {
      user_id: user_id,
      filename: existingDownload.filename,
      space_url,
      status: 'completed' as const,
      is_deleted: false,
      is_archived: false,
    }

    const dl = await updateOrInsertDownload(data, download_id)
    return { dl, startDownloading: false }
  }

  if (download_id) {
    const dl = await updateOrInsertDownload(
      {
        status: 'pending',
        is_deleted: false,
        is_archived: false,
      },
      download_id
    )
    return { dl, startDownloading: true }
  }

  const dl = await updateOrInsertDownload({
    user_id,
    space_url,
    status: 'pending',
    is_deleted: false,
  })
  return { dl, startDownloading: true }
}

// export const download = async ({ space_url, user_id, download_id }: Download) => {
//   const dl: DlType | undefined = await findDlBySpaceUrl(space_url)
//
//   // if the download id is passed, we need to rownload the space
//   if (download_id) {
//     // if the filename already exists on the server, update the filename (avoiding redownload the space)
//     if (dl?.filename) {
//       const { data, error } = await supabase
//         .from('downloads')
//         .update({
//           filename: dl.filename,
//           status: 'completed',
//           is_deleted: false,
//           is_archived: false,
//         })
//         .eq('id', download_id)
//         .select()
//
//       if (error) {
//         console.error('1 Error updating download record with the exsiting filename')
//         throw error
//       }
//
//       return {
//         dl: data[0],
//         startDownloading: false,
//       }
//     }
//
//     // if there is no filename, the record already exists, but it's expired so we need to redowload it
//     const { data, error } = await supabase
//       .from('downloads')
//       .update({
//         status: 'pending',
//         is_deleted: false,
//         is_archived: false,
//       })
//       .eq('id', download_id)
//       .select()
//
//     if (error) {
//       console.error('2 Error re-downloading download record:', error)
//       throw error
//     }
//
//     return {
//       dl: data[0],
//       startDownloading: false,
//     }
//   }
//
//   // we need to create a new dl record
//   // if the filename already exists create a new record with it
//   if (dl?.filename) {
//     const { data, error } = await supabase
//       .from('downloads')
//       .insert({
//         user_id: user_id,
//         space_url: space_url,
//         filename: dl.filename,
//         status: 'completed',
//         is_deleted: false,
//       })
//       .select()
//
//     if (error) {
//       console.error('3 Error creating download record:', error)
//       throw error
//     }
//
//     return {
//       dl: data[0],
//       startDownloading: false,
//     }
//   }
//
//   // start the normal downloading proccess
//   const { data, error } = await supabase
//     .from('downloads')
//     .insert({
//       user_id: user_id,
//       space_url: space_url,
//       status: 'pending',
//       is_deleted: false,
//     })
//     .select()
//
//   if (error) {
//     console.error('4 Error creating download record:', error)
//     throw error
//   }
//
//   return {
//     dl: data[0],
//     startDownloading: true,
//   }
// }

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
