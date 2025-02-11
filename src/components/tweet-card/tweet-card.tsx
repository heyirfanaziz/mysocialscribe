import { LuLoaderCircle } from 'react-icons/lu'

import { TweetCardType } from '@/types/TweetCardType'
import { formatDate } from '@/utils/format'

import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import TweetCardHeader from '@/components/tweet-card/tweet-card-header'
import TweetCardContent from '@/components/tweet-card/tweet-card-content'
import TweetInfo from '@/components/tweet-card/tweet-info'
import TweetDelBtn from '@/components/tweet-card/tweet-delete-btn'
import TweetDownloadAgainBtn from '@/components/tweet-card/tweet-download-again-btn'
import TweetPlayBtn from '@/components/tweet-card/tweet-play-btn'
import TweetDownloadBtn from '@/components/tweet-card/tweet-download-btn'
import TweetShare from '@/components/tweet-card/tweet-share'
import TweetTranscribeBtn from '@/components/tweet-card/tweet-transcribe-btn'

const TweetCard = ({ tweet, download, email }: TweetCardType) => {
  if (!tweet) {
    return (
      <Card className="z-50 flex h-fit w-full flex-col overflow-auto rounded-lg shadow-xl dark:bg-zinc-950">
        <CardHeader className="flex flex-row items-center justify-center gap-3 p-3">
          This tweet may have been deleted
        </CardHeader>
      </Card>
    )
  }

  const { created_at, user_id, filename, space_url, is_deleted, status, id } = download
  const isDownloading = status === 'pending' && !is_deleted

  return (
    <div className="z-50 space-y-1">
      {/* created_at */}
      {filename && <p className="dark-fit text-xs">Downloaded at {formatDate(created_at)}</p>}

      <Card className="flex h-fit w-full flex-col overflow-auto rounded-lg shadow-xl dark:bg-zinc-950">
        <CardHeader className="flex flex-row justify-between gap-3 p-3">
          <TweetCardHeader
            tweet={tweet}
            isDeleted={is_deleted}
          />
        </CardHeader>

        <CardContent className="px-3 py-1">
          <TweetCardContent
            entities={tweet.entities}
            isDeleted={is_deleted}
          />
        </CardContent>

        <CardFooter className="justify-between px-3 pb-3 pt-3">
          <TweetInfo
            favorite_count={tweet.favorite_count}
            created_at={created_at}
            is_deleted={is_deleted}
          />

          {/*  Space is downloading */}
          {isDownloading && !is_deleted && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 text-stone-50"
              disabled
            >
              Downloading
              <LuLoaderCircle className="h-5 w-5 animate-spin" />
            </Button>
          )}

          {/* Space is downloaded */}
          {filename && (
            <div className="z-50 flex items-center gap-2">
              <TweetShare
                spaceUrl={space_url}
                downloadId={id}
              />
              <TweetPlayBtn filename={filename} />
              <TweetDownloadBtn filename={filename} />
              <TweetTranscribeBtn downloadId={id} />
            </div>
          )}

          {/* Space is deleted */}
          {is_deleted && (
            <div className="z-50 flex items-center gap-2">
              <TweetDelBtn downloadId={id} />

              <TweetDownloadAgainBtn
                tweetUrl={space_url}
                user_id={user_id!}
                email={email}
                isDownloading={isDownloading}
                downloadId={id}
              />
            </div>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}

export default TweetCard
