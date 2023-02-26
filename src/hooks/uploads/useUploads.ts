import { Score } from '@/models/score'
import { useEffect, useState } from 'react'

type ReturnType = {
  loading: boolean
  success: boolean
  uploads: Score[]
}

export const useUploads = (): ReturnType => {
  const [loading, setLoading] = useState(true)
  const [success, setSuccess] = useState(false)
  const [uploads, setUploads] = useState<Score[]>([])

  const fetchUploads = async (cancel: boolean) => {
    try {
      if (cancel) {
        return
      }

      const response = await fetch(`/api/uploads`)
      const results = await response.json()

      setUploads(results)
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
    uploads,
  }
}
