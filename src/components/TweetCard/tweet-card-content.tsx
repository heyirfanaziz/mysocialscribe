import { useMemo } from 'react'
import { type EnrichedTweet } from 'react-tweet'

type TweetEntity = EnrichedTweet['entities'][number]

const TweetCardContent = ({ entities }: { entities: TweetEntity[] }) => {
  const renderEntities = useMemo(() => {
    return entities
      .map((entity, idx) => {
        const commonProps = {
          className: 'text-sm font-normal',
        }

        switch (entity.type) {
          case 'url':
          case 'symbol':
          case 'hashtag':
          case 'mention':
            return (
              <a
                key={idx}
                href={entity.href}
                target="_blank"
                rel="noopener noreferrer"
                {...commonProps}
                className={`${commonProps.className} text-gray-500`}
              >
                {entity.text}
              </a>
            )

          case 'text':
            return (
              <span
                key={idx}
                {...commonProps}
                dangerouslySetInnerHTML={{ __html: entity.text }}
              />
            )

          default:
            return null
        }
      })
      .filter(Boolean)
  }, [entities])

  return <div className="break-words">{renderEntities}</div>
}

export default TweetCardContent
