import { useState, useCallback, useMemo } from 'react'
import { FormState, FormField } from '../types'

export const useForm = <T extends Record<string, any>>(initialValues: T) => {
  const [formState, setFormState] = useState<FormState>(() => {
    const state: FormState = {}
    Object.keys(initialValues).forEach(key => {
      state[key] = {
        value: initialValues[key] || '',
        error: '',
        touched: false
      }
    })
    return state
  })

  const setFieldValue = useCallback((field: keyof T, value: string) => {
    setFormState(prev => ({
      ...prev,
      [field]: {
        ...prev[field as string],
        value,
        error: '' // Clear error when user types
      }
    }))
  }, [])

  const setFieldError = useCallback((field: keyof T, error: string) => {
    setFormState(prev => ({
      ...prev,
      [field]: {
        ...prev[field as string],
        error
      }
    }))
  }, [])

  const setFieldTouched = useCallback((field: keyof T, touched: boolean = true) => {
    setFormState(prev => ({
      ...prev,
      [field]: {
        ...prev[field as string],
        touched
      }
    }))
  }, [])

  const validateField = useCallback((field: keyof T, validator: (value: string) => string) => {
    const fieldState = formState[field as string]
    const error = validator(fieldState.value)
    setFieldError(field, error)
    return error === ''
  }, [formState, setFieldError])

  const validateForm = useCallback((validators: Record<keyof T, (value: string) => string>) => {
    let isValid = true
    Object.keys(validators).forEach(key => {
      const fieldKey = key as keyof T
      const fieldValid = validateField(fieldKey, validators[fieldKey])
      if (!fieldValid) isValid = false
    })
    return isValid
  }, [validateField])

  const resetForm = useCallback(() => {
    setFormState(prev => {
      const newState: FormState = {}
      Object.keys(prev).forEach(key => {
        newState[key] = {
          value: '',
          error: '',
          touched: false
        }
      })
      return newState
    })
  }, [])

  const getFieldProps = useCallback((field: keyof T) => {
    const fieldState = formState[field as string]
    return {
      value: fieldState.value,
      error: fieldState.error,
      touched: fieldState.touched,
      onChange: (value: string) => setFieldValue(field, value),
      onBlur: () => setFieldTouched(field, true)
    }
  }, [formState, setFieldValue, setFieldTouched])

  const values = useMemo(() => {
    const result: Partial<T> = {}
    Object.keys(formState).forEach(key => {
      result[key as keyof T] = formState[key].value as T[keyof T]
    })
    return result
  }, [formState])

  const errors = useMemo(() => {
    const result: Partial<Record<keyof T, string>> = {}
    Object.keys(formState).forEach(key => {
      result[key as keyof T] = formState[key].error
    })
    return result
  }, [formState])

  const hasErrors = useMemo(() => {
    return Object.values(formState).some(field => field.error !== '')
  }, [formState])

  const isDirty = useMemo(() => {
    return Object.values(formState).some(field => field.value !== '')
  }, [formState])

  return {
    formState,
    values,
    errors,
    hasErrors,
    isDirty,
    setFieldValue,
    setFieldError,
    setFieldTouched,
    validateField,
    validateForm,
    resetForm,
    getFieldProps
  }
} 