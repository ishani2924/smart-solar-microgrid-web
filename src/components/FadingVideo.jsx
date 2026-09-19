import { useRef, useEffect, useState, useCallback } from 'react'

export default function FadingVideo({ src, className = '', style = {} }) {
  const videoRef = useRef(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const fadeRef = useRef(null)
  const isArray = Array.isArray(src)
  const currentSrc = isArray ? src[currentIndex] : src

  const fadeIn = useCallback(() => {
    const video = videoRef.current
    if (!video) return
    if (fadeRef.current) cancelAnimationFrame(fadeRef.current)
    let opacity = 0
    const start = performance.now()
    const duration = 500

    const step = (now) => {
      const elapsed = now - start
      opacity = Math.min(elapsed / duration, 1)
      video.style.opacity = opacity
      if (opacity < 1) {
        fadeRef.current = requestAnimationFrame(step)
      }
    }
    fadeRef.current = requestAnimationFrame(step)
  }, [])

  const fadeOut = useCallback(() => {
    const video = videoRef.current
    if (!video) return
    if (fadeRef.current) cancelAnimationFrame(fadeRef.current)
    const startOpacity = parseFloat(video.style.opacity) || 1
    const start = performance.now()
    const duration = 550

    const step = (now) => {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      video.style.opacity = startOpacity * (1 - progress)
      if (progress < 1) {
        fadeRef.current = requestAnimationFrame(step)
      }
    }
    fadeRef.current = requestAnimationFrame(step)
  }, [])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    video.style.opacity = '0'

    const handleLoadedData = () => fadeIn()

    const handleTimeUpdate = () => {
      if (video.duration && video.currentTime >= video.duration - 0.55) {
        fadeOut()
      }
    }

    const handleEnded = () => {
      if (isArray) {
        setCurrentIndex((prev) => (prev + 1) % src.length)
      } else {
        video.currentTime = 0
        video.play().then(fadeIn).catch(() => {})
      }
    }

    video.addEventListener('loadeddata', handleLoadedData)
    video.addEventListener('timeupdate', handleTimeUpdate)
    video.addEventListener('ended', handleEnded)

    return () => {
      video.removeEventListener('loadeddata', handleLoadedData)
      video.removeEventListener('timeupdate', handleTimeUpdate)
      video.removeEventListener('ended', handleEnded)
      if (fadeRef.current) cancelAnimationFrame(fadeRef.current)
    }
  }, [currentSrc, fadeIn, fadeOut, isArray, src])

  return (
    <video
      ref={videoRef}
      key={currentSrc}
      src={currentSrc}
      className={className}
      style={{ opacity: 0, ...style }}
      autoPlay
      muted
      playsInline
      preload="auto"
    />
  )
}
