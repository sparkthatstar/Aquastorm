'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function AutoRefresh({ interval = 3000 }: { interval?: number }) {
  const router = useRouter()

  useEffect(() => {
    const timer = setInterval(() => {
      router.refresh()
    }, interval)

    return () => clearInterval(timer)
  }, [router, interval])

  return null
}
