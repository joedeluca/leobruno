"use client"

import { useState, useRef, useEffect } from "react"

interface PoemAudioPlayerProps {
  audioUrl?: string
}

// Extract title and author from filename
// e.g., "/audio/poems/the-red-wheelbarrow-by-william-carlos-williams.m4a"
// becomes { title: "The Red Wheelbarrow", author: "William Carlos Williams" }
function parseAudioFilename(
  url: string
): { title: string; author: string } | null {
  const filename = url.split("/").pop()?.replace(".m4a", "") || ""
  const parts = filename.split("-by-")

  if (parts.length !== 2) return null

  const titleSlug = parts[0]
  const authorSlug = parts[1]

  // Convert slugs to title case
  const toTitleCase = (slug: string) => {
    return slug
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  }

  return {
    title: toTitleCase(titleSlug),
    author: toTitleCase(authorSlug),
  }
}

export default function PoemAudioPlayer({ audioUrl }: PoemAudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const audioRef = useRef<HTMLAudioElement>(null)

  // Extract title and author from filename
  const poemInfo = audioUrl ? parseAudioFilename(audioUrl) : null

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const updateTime = () => setCurrentTime(audio.currentTime)
    const updateDuration = () => setDuration(audio.duration)
    const handleEnded = () => setIsPlaying(false)

    audio.addEventListener("timeupdate", updateTime)
    audio.addEventListener("loadedmetadata", updateDuration)
    audio.addEventListener("ended", handleEnded)

    return () => {
      audio.removeEventListener("timeupdate", updateTime)
      audio.removeEventListener("loadedmetadata", updateDuration)
      audio.removeEventListener("ended", handleEnded)
    }
  }, [])

  const togglePlay = () => {
    if (!audioRef.current) return

    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.play()
    }
    setIsPlaying(!isPlaying)
  }

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return "0:00"
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value)
    if (audioRef.current) {
      audioRef.current.currentTime = time
      setCurrentTime(time)
    }
  }

  const handleSeekStart = () => {
    if (audioRef.current && isPlaying) {
      audioRef.current.pause()
    }
  }

  const handleSeekEnd = () => {
    if (audioRef.current && isPlaying) {
      audioRef.current.play()
    }
  }

  // If no audio URL provided, don't render anything
  if (!audioUrl) return null

  return (
    <div className="mb-6 p-4 bg-zinc-900/50 rounded-lg border border-zinc-800">
      <audio ref={audioRef} src={audioUrl} preload="metadata" />

      <div className="flex items-center gap-4">
        {/* Play/Pause Button */}
        <button
          onClick={togglePlay}
          className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-zinc-800 hover:bg-zinc-700 transition-colors"
          aria-label={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? (
            // Pause icon
            <svg
              className="w-5 h-5 text-zinc-100"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
            </svg>
          ) : (
            // Play icon
            <svg
              className="w-5 h-5 text-zinc-100 ml-0.5"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>

        {/* Progress Bar */}
        <div className="flex-1 flex items-center gap-3">
          <span className="text-xs text-zinc-500 font-mono min-w-[40px]">
            {formatTime(currentTime)}
          </span>

          <input
            type="range"
            min="0"
            max={duration || 0}
            step="0.01"
            value={currentTime}
            onChange={handleSeek}
            onMouseDown={handleSeekStart}
            onMouseUp={handleSeekEnd}
            onTouchStart={handleSeekStart}
            onTouchEnd={handleSeekEnd}
            className="flex-1 h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer
              [&::-webkit-slider-thumb]:appearance-none
              [&::-webkit-slider-thumb]:w-3
              [&::-webkit-slider-thumb]:h-3
              [&::-webkit-slider-thumb]:rounded-full
              [&::-webkit-slider-thumb]:bg-zinc-100
              [&::-webkit-slider-thumb]:cursor-pointer
              [&::-webkit-slider-thumb]:transition-transform
              [&::-webkit-slider-thumb]:hover:scale-110
              [&::-webkit-slider-runnable-track]:h-1
              [&::-webkit-slider-runnable-track]:rounded-lg
              [&::-moz-range-thumb]:w-3
              [&::-moz-range-thumb]:h-3
              [&::-moz-range-thumb]:rounded-full
              [&::-moz-range-thumb]:bg-zinc-100
              [&::-moz-range-thumb]:border-0
              [&::-moz-range-thumb]:cursor-pointer
              [&::-moz-range-thumb]:transition-transform
              [&::-moz-range-thumb]:hover:scale-110
              [&::-moz-range-track]:h-1
              [&::-moz-range-track]:rounded-lg"
            style={{
              background: `linear-gradient(to right, #f4f4f5 0%, #f4f4f5 ${
                duration ? (currentTime / duration) * 100 : 0
              }%, #27272a ${
                duration ? (currentTime / duration) * 100 : 0
              }%, #27272a 100%)`,
            }}
          />

          <span className="text-xs text-zinc-500 font-mono min-w-[40px]">
            {formatTime(duration)}
          </span>
        </div>
      </div>

      <div className="mt-2 text-xs text-zinc-600">
        {poemInfo && (
          <div className="mb-1">
            <span className="italic">"{poemInfo.title}"</span> by{" "}
            {poemInfo.author}
          </div>
        )}
        <div className="italic">Reading by Leo Bruno</div>
      </div>
    </div>
  )
}
