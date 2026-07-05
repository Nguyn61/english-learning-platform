'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

interface UseExamTimerOptions {
  totalSeconds: number
  onExpire: () => void
  autoStart?: boolean
}

export function useExamTimer({ totalSeconds, onExpire, autoStart = false }: UseExamTimerOptions) {
  const [secondsLeft, setSecondsLeft] = useState(totalSeconds)
  const [isRunning, setIsRunning] = useState(autoStart)
  const onExpireRef = useRef(onExpire)
  onExpireRef.current = onExpire

  useEffect(() => {
    if (!isRunning) return
    if (secondsLeft <= 0) {
      onExpireRef.current()
      return
    }
    const id = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(id)
          onExpireRef.current()
          return 0
        }
        return s - 1
      })
    }, 1000)
    return () => clearInterval(id)
  }, [isRunning, secondsLeft])

  const start = useCallback(() => setIsRunning(true), [])
  const stop = useCallback(() => setIsRunning(false), [])
  const reset = useCallback(() => {
    setIsRunning(false)
    setSecondsLeft(totalSeconds)
  }, [totalSeconds])

  const minutes = Math.floor(secondsLeft / 60)
  const seconds = secondsLeft % 60
  const formatted = `${minutes}:${seconds.toString().padStart(2, '0')}`
  const percentLeft = totalSeconds > 0 ? (secondsLeft / totalSeconds) * 100 : 0
  const isWarning = secondsLeft <= 120 && secondsLeft > 30
  const isCritical = secondsLeft <= 30

  return { secondsLeft, minutes, seconds, formatted, percentLeft, isRunning, isWarning, isCritical, start, stop, reset }
}
