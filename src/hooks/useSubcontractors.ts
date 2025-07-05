import { useState, useEffect } from 'react'
import { supabase, testConnection } from '../lib/supabase'
import { Subcontractor } from '../types'

// Mock data for development when Supabase is not configured
const mockSubcontractors: Subcontractor[] = [
  {
    id: '1',
    name: 'Mike Johnson',
    phone: '(555) 987-6543',
    email: 'mike@example.com',
    region: 'Downtown',
    created_at: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Lisa Davis',
    phone: '(555) 876-5432',
    email: 'lisa@example.com',
    region: 'Northside',
    created_at: new Date().toISOString()
  },
  {
    id: '3',
    name: 'Robert Chen',
    phone: '(555) 765-4321',
    email: 'robert@example.com',
    region: 'Westside',
    created_at: new Date().toISOString()
  }
]

export const useSubcontractors = () => {
  const [subcontractors, setSubcontractors] = useState<Subcontractor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isUsingMockData, setIsUsingMockData] = useState(false)

  const fetchSubcontractors = async () => {
    try {
      setLoading(true)
      setError(null)
      
      console.log('Fetching subcontractors from Supabase...')
      
      // Test connection first with enhanced error handling
      const connectionResult = await testConnection()
      if (!connectionResult.success) {
        console.log('Supabase not available, using mock data')
        setSubcontractors(mockSubcontractors)
        setIsUsingMockData(true)
        return
      }

      // Set a timeout for the request
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 15000) // 15 second timeout

      const { data, error } = await supabase
        .from('subcontractors')
        .select('*')
        .order('name')

      clearTimeout(timeoutId)

      if (error) {
        console.error('Supabase fetch error:', error)
        console.log('Falling back to mock data')
        setSubcontractors(mockSubcontractors)
        setIsUsingMockData(true)
        return
      }

      console.log('Subcontractors fetched successfully:', data?.length || 0, 'subcontractors')
      setSubcontractors(data || [])
      setIsUsingMockData(false)
    } catch (err) {
      console.error('Error in fetchSubcontractors:', err)
      console.log('Using mock data due to error')
      setSubcontractors(mockSubcontractors)
      setIsUsingMockData(true)
    } finally {
      setLoading(false)
    }
  }

  const createSubcontractor = async (subcontractorData: Omit<Subcontractor, 'id' | 'created_at'>) => {
    try {
      console.log('Creating subcontractor with data:', subcontractorData)
      
      // Validate required fields
      if (!subcontractorData.name || !subcontractorData.phone || !subcontractorData.email || !subcontractorData.region) {
        throw new Error('Missing required fields: name, phone, email, and region are required')
      }

      // If using mock data, just add to local state
      if (isUsingMockData) {
        const newSubcontractor: Subcontractor = {
          id: Date.now().toString(),
          ...subcontractorData,
          created_at: new Date().toISOString()
        }
        
        setSubcontractors(prev => [...prev, newSubcontractor].sort((a, b) => a.name.localeCompare(b.name)))
        return newSubcontractor
      }

      // Test connection first
      const connectionResult = await testConnection()
      if (!connectionResult.success) {
        throw new Error(connectionResult.error || 'Unable to connect to database')
      }

      // Set a timeout for the request
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 15000) // 15 second timeout

      const { data, error } = await supabase
        .from('subcontractors')
        .insert(subcontractorData)
        .select()
        .single()

      clearTimeout(timeoutId)

      if (error) {
        console.error('Supabase insert error:', error)
        throw new Error(`Database error: ${error.message}`)
      }

      if (!data) {
        throw new Error('No data returned after subcontractor creation')
      }

      console.log('Subcontractor created successfully:', data)
      
      setSubcontractors(prev => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)))
      return data
    } catch (err) {
      console.error('Error in createSubcontractor:', err)
      
      if (err instanceof Error) {
        if (err.name === 'AbortError') {
          throw new Error('Request timeout. Please check your internet connection and try again.')
        } else if (err.message.includes('Failed to fetch')) {
          throw new Error('Network error. Please check your internet connection and Supabase configuration.')
        } else {
          throw new Error(err.message)
        }
      } else {
        throw new Error('Failed to create subcontractor')
      }
    }
  }

  const updateSubcontractor = async (id: string, updates: Partial<Omit<Subcontractor, 'id' | 'created_at'>>) => {
    try {
      console.log('Updating subcontractor:', id, 'with updates:', updates)
      
      // Validate required fields
      if (updates.name !== undefined && !updates.name) {
        throw new Error('Name is required')
      }
      if (updates.phone !== undefined && !updates.phone) {
        throw new Error('Phone is required')
      }
      if (updates.email !== undefined && !updates.email) {
        throw new Error('Email is required')
      }
      if (updates.region !== undefined && !updates.region) {
        throw new Error('Region is required')
      }

      // If using mock data, update local state
      if (isUsingMockData) {
        setSubcontractors(prev => prev.map(sub => 
          sub.id === id ? { ...sub, ...updates } : sub
        ).sort((a, b) => a.name.localeCompare(b.name)))
        return
      }

      // Test connection first
      const connectionResult = await testConnection()
      if (!connectionResult.success) {
        throw new Error(connectionResult.error || 'Unable to connect to database')
      }

      // Set a timeout for the request
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 15000) // 15 second timeout

      const { data, error } = await supabase
        .from('subcontractors')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      clearTimeout(timeoutId)

      if (error) {
        console.error('Supabase update error:', error)
        throw new Error(`Database error: ${error.message}`)
      }

      if (!data) {
        throw new Error('No data returned after subcontractor update')
      }

      console.log('Subcontractor updated successfully:', data)
      
      setSubcontractors(prev => prev.map(sub => 
        sub.id === id ? data : sub
      ).sort((a, b) => a.name.localeCompare(b.name)))
      
      return data
    } catch (err) {
      console.error('Error in updateSubcontractor:', err)
      
      if (err instanceof Error) {
        if (err.name === 'AbortError') {
          throw new Error('Request timeout. Please check your internet connection and try again.')
        } else if (err.message.includes('Failed to fetch')) {
          throw new Error('Network error. Please check your internet connection and Supabase configuration.')
        } else {
          throw new Error(err.message)
        }
      } else {
        throw new Error('Failed to update subcontractor')
      }
    }
  }

  const deleteSubcontractor = async (id: string) => {
    try {
      console.log('Deleting subcontractor:', id)

      // If using mock data, remove from local state
      if (isUsingMockData) {
        setSubcontractors(prev => prev.filter(sub => sub.id !== id))
        return
      }

      // Test connection first
      const connectionResult = await testConnection()
      if (!connectionResult.success) {
        throw new Error(connectionResult.error || 'Unable to connect to database')
      }

      // Set a timeout for the request
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 15000) // 15 second timeout

      const { error } = await supabase
        .from('subcontractors')
        .delete()
        .eq('id', id)

      clearTimeout(timeoutId)

      if (error) {
        console.error('Supabase delete error:', error)
        throw new Error(`Database error: ${error.message}`)
      }

      console.log('Subcontractor deleted successfully')
      
      setSubcontractors(prev => prev.filter(sub => sub.id !== id))
    } catch (err) {
      console.error('Error in deleteSubcontractor:', err)
      
      if (err instanceof Error) {
        if (err.name === 'AbortError') {
          throw new Error('Request timeout. Please check your internet connection and try again.')
        } else if (err.message.includes('Failed to fetch')) {
          throw new Error('Network error. Please check your internet connection and Supabase configuration.')
        } else {
          throw new Error(err.message)
        }
      } else {
        throw new Error('Failed to delete subcontractor')
      }
    }
  }

  useEffect(() => {
    fetchSubcontractors()
  }, [])

  return {
    subcontractors,
    loading,
    error,
    fetchSubcontractors,
    createSubcontractor,
    updateSubcontractor,
    deleteSubcontractor,
    isUsingMockData
  }
}