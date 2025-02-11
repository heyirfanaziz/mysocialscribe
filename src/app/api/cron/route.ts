import { NextResponse } from 'next/server'
import { createClient } from '@/db/supabase/server'
import { getRecentDownloads, removeCachedDownload } from '@/db/supabase/services/downloads.service'
import { DlType } from '@/types/DownlodsType'

export async function GET() {
  try {
    const supabase = await createClient()
    
    const oldDownloads = await getRecentDownloads()

    const cleanupTasks = oldDownloads.map(async (download: DlType) => {
      if (download.filename) {
        // Remove file from Supabase Storage
        await supabase.storage
          .from('space-audio')
          .remove([download.filename])
          .catch(console.error)
      }
      
      await removeCachedDownload(download.id)
    })

    await Promise.all(cleanupTasks)

    return NextResponse.json({ message: 'Cron job executed successfully' }, { status: 200 })
  } catch (error) {
    console.error('Cleanup process failed:', error)
    return NextResponse.json({ error: 'Cleanup failed' }, { status: 500 })
  }
}
