'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

let interval: any

type Card = {
  content: React.ReactNode
}

export const CardStack = ({
  items,
  offset,
  scaleFactor,
}: {
  items: Card[]
  offset?: number
  scaleFactor?: number
}) => {
  const CARD_OFFSET = offset || 10
  const SCALE_FACTOR = scaleFactor || 0.06
  const [cards, setCards] = useState<Card[]>(items)

  useEffect(() => {
    startFlipping()

    return () => clearInterval(interval)
  }, [])
  const startFlipping = () => {
    interval = setInterval(() => {
      setCards((prevCards: Card[]) => {
        const newArray = [...prevCards] // create a copy of the array
        newArray.unshift(newArray.pop()!) // move the last element to the front
        return newArray
      })
    }, 7000)
  }

  return (
    <div className="relative h-40 w-72">
      {cards.map((card, index) => {
        return (
          <motion.div
            key={index}
            className="absolute flex h-40 w-72 flex-col justify-between rounded-3xl border border-neutral-200 bg-white p-4 shadow-xl shadow-black/[0.1] dark:border-white/[0.1] dark:bg-black dark:shadow-white/[0.05]"
            style={{
              transformOrigin: 'top center',
            }}
            animate={{
              top: index * -CARD_OFFSET,
              scale: 1 - index * SCALE_FACTOR, // decrease scale for cards that are behind
              zIndex: cards.length - index, //  decrease z-index for the cards that are behind
            }}
          >
            <div className="font-normal text-neutral-700 dark:text-neutral-200">{card.content}</div>
          </motion.div>
        )
      })}
    </div>
  )
}
