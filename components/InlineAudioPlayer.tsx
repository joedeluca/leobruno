"use client"

import { useState, useRef, useEffect } from "react"

interface InlineAudioPlayerProps {
  audioUrl: string
  title: string
  author: string
}

export default function InlineAudioPlayer({
  audioUrl,
  title,
  author,
}: InlineAudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [showPlayer, setShowPlayer] = useState(false)
  const [audioExists, setAudioExists] = useState(false)
  const [isChecking, setIsChecking] = useState(true)
  const audioRef = useRef<HTMLAudioElement>(null)

  // Check if audio file exists
  useEffect(() => {
    const audio = new Audio()
    audio.src = audioUrl

    audio.addEventListener("canplay", () => {
      setAudioExists(true)
      setIsChecking(false)
    })

    audio.addEventListener("error", () => {
      setAudioExists(false)
      setIsChecking(false)
    })

    audio.load()

    return () => {
      audio.pause()
      audio.src = ""
    }
  }, [audioUrl])

  const togglePlayPause = () => {
    if (!audioRef.current) return

    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.play()
    }
    setIsPlaying(!isPlaying)
  }

  const handleAudioIconClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!showPlayer) {
      setShowPlayer(true)
      // Start playing after a brief delay to let the audio element mount
      setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.play()
          setIsPlaying(true)
        }
      }, 100)
    } else {
      togglePlayPause()
    }
  }

  const handleEnded = () => {
    setIsPlaying(false)
  }

  // Don't show anything if audio doesn't exist
  if (isChecking || !audioExists) {
    return null
  }

  return (
    <div className="inline-flex items-center gap-2">
      <button
        onClick={handleAudioIconClick}
        className="text-zinc-500 hover:text-tiepolo-pink-500 transition-colors"
        title={`${isPlaying ? "Pause" : "Play"} audio`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className="w-4 h-4"
        >
          {isPlaying ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 5.25v13.5m-7.5-13.5v13.5"
            />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z"
            />
          )}
        </svg>
      </button>

      {showPlayer && (
        <audio
          ref={audioRef}
          src={audioUrl}
          onEnded={handleEnded}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        />
      )}
    </div>
  )
}
