import { useState, useCallback } from 'react'
import { ApiResponse } from '../types'

interface UseApiState<T> {
  data: T | null
  loading: boolean
  error: string | null
}

export const useApi = <T>() => {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null
  })

  const execute = useCallback(async (apiCall: () => Promise<ApiResponse<T>>) => {
    setState(prev => ({ ...prev, loading: true, error: null }))
    
    try {
      const response = await apiCall()
      
      if (response.success) {
        setState({
          data: response.data || null,
          loading: false,
          error: null
        })
        return { success: true, data: response.data }
      } else {
        setState({
          data: null,
          loading: false,
          error: response.message || 'An error occurred'
        })
        return { success: false, error: response.message }
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'An error occurred'
      setState({
        data: null,
        loading: false,
        error: errorMessage
      })
      return { success: false, error: errorMessage }
    }
  }, [])

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null
    })
  }, [])

  return {
    ...state,
    execute,
    reset
  }
} 