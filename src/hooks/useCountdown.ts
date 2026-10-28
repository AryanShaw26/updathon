import { useEffect, useState } from 'react'
import { getCountdownParts } from '../utils/countdown'

export function useCountdown(targetDate: Date | string) {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const intervalId = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(intervalId)
  }, [])

  return getCountdownParts(targetDate, now)
}
