import { useRef, useEffect, useState } from 'react'
import { motion } from 'framer-motion'

export default function BlurText({ text, className = '' }) {
  const containerRef = useRef(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.1 }
    )

    if (containerRef.current) {
      observer.observe(containerRef.current)
    }

    return () => observer.disconnect()
  }, [])

  const words = text.split(' ')

  return (
    <div
      ref={containerRef}
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        rowGap: '0.1em',
      }}
      className={className}
    >
      {words.map((word, i) => (
        <motion.span
          key={i}
          style={{ display: 'inline-block', marginRight: '0.28em' }}
          initial={{ filter: 'blur(10px)', opacity: 0, y: 50 }}
          animate={
            isVisible
              ? { filter: 'blur(0px)', opacity: 1, y: 0 }
              : { filter: 'blur(10px)', opacity: 0, y: 50 }
          }
          transition={{
            duration: 0.7,
            delay: i * 0.1,
            ease: 'easeOut',
          }}
        >
          {word}
        </motion.span>
      ))}
    </div>
  )
}
