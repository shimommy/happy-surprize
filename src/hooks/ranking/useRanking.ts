import { Score } from '@/models/score'
import { useEffect, useState } from 'react'

type ReturnType = {
  loading: boolean
  success: boolean
  ranking: Score[]
}

export const useRanking = (): ReturnType => {
  const [loading, setLoading] = useState(true)
  const [success, setSuccess] = useState(false)
  const [ranking, setRanking] = useState<Score[]>([])

  const fetchUploads = async (cancel: boolean) => {
    try {
      if (cancel) {
        return
      }

      const response = await fetch(`/api/ranking`)
      const results = await response.json()

      setRanking(results)
      setSuccess(true)
    } catch {
      if (cancel) {
        return
      }

      setSuccess(false)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let cancel = false

    fetchUploads(cancel)
    return () => {
      cancel = true
    }
  }, [])

  return {
    loading,
    success,
    ranking,
  }
}
