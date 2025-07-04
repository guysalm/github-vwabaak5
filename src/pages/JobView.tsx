import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Job, Subcontractor } from '../types'
import { useNotification } from '../hooks/useNotification'
import { useJobUpdates } from '../hooks/useJobUpdates'
import { 
  ArrowLeft, 
  User, 
  Phone, 
  MapPin, 
  FileText, 
  DollarSign, 
  Save,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2
} from 'lucide-react'

const JobView: React.FC = () => {
  const { jobId } = useParams<{ jobId: string }>()
  const navigate = useNavigate()
  const { showNotification } = useNotification()
  const { createUpdate } = useJobUpdates()
  
  const [job, setJob] = useState<Job | null>(null)
  const [subcontractors, setSubcontractors] = useState<Subcontractor[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedSubcontractorId, setSelectedSubcontractorId] = useState<string>('')
  
  const [formData, setFormData] = useState({
    status: 'pending' as const,
    materials: '',
    price: '',
    parts_cost: '',
    job_profit: '',
    notes: ''
  })

  useEffect(() => {
    let isMounted = true

    const fetchJob = async () => {
      if (!jobId) return
      
      try {
        setLoading(true)
        setError(null)
        
        console.log('Fetching job with ID:', jobId)
        
        const { data, error: fetchError } = await supabase
          .from('jobs')
          .select(`
            *,
            subcontractor:subcontractors(*)
          `)
          .eq('job_id', jobId)
          .single()

        if (!isMounted) return

        if (fetchError) {
          console.error('Supabase error:', fetchError)
          throw new Error('Job not found')
        }

        if (!data) {
          throw new Error('Job not found')
        }

        console.log('Job data received:', data)
        setJob(data)
        setFormData({
          status: data.status,
          materials: data.materials || '',
          price: data.price?.toString() || '',
          parts_cost: data.parts_cost?.toString() || '',
          job_profit: data.job_profit?.toString() || '',
          notes: data.notes || ''
        })
        setSelectedSubcontractorId(data.subcontractor_id)
      } catch (err) {
        if (!isMounted) return
        console.error('Error fetching job:', err)
        setError(err instanceof Error ? err.message : 'Job not found')
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchJob()

    return () => {
      isMounted = false
    }
  }, [jobId])

  useEffect(() => {
    const fetchSubcontractors = async () => {
      try {
        const { data, error } = await supabase
          .from('subcontractors')
          .select('*')
          .order('name')

        if (error) throw error
        setSubcontractors(data || [])
      } catch (err) {
        console.error('Error fetching subcontractors:', err)
      }
    }

    fetchSubcontractors()
  }, [])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    if (!job) return

    try {
      setSaving(true)
      
      const updates: any = {
        status: formData.status,
        materials: formData.materials,
        price: formData.price ? parseFloat(formData.price) : null,
        parts_cost: formData.parts_cost ? parseFloat(formData.parts_cost) : null,
        job_profit: formData.job_profit ? parseFloat(formData.job_profit) : null,
        notes: formData.notes,
        subcontractor_id: selectedSubcontractorId || null,
        updated_at: new Date().toISOString()
      }

      const { error } = await supabase
        .from('jobs')
        .update(updates)
        .eq('id', job.id)

      if (error) throw error

      // Log updates for changed fields
      const fieldsToCheck = [
        { key: 'status', oldValue: job.status, newValue: formData.status },
        { key: 'materials', oldValue: job.materials, newValue: formData.materials },
        { key: 'price', oldValue: job.price?.toString(), newValue: formData.price },
        { key: 'parts_cost', oldValue: job.parts_cost?.toString(), newValue: formData.parts_cost },
        { key: 'job_profit', oldValue: job.job_profit?.toString(), newValue: formData.job_profit },
        { key: 'notes', oldValue: job.notes, newValue: formData.notes },
        { key: 'subcontractor_id', oldValue: job.subcontractor_id, newValue: selectedSubcontractorId }
      ]

      for (const field of fieldsToCheck) {
        if (field.oldValue !== field.newValue) {
          await createUpdate(job.id, field.key, field.oldValue || '', field.newValue || '', 'System')
        }
      }

      setJob(prev => prev ? { ...prev, ...updates } : null)
      showNotification('Job updated successfully', 'success')
    } catch (err) {
      console.error('Error updating job:', err)
      showNotification('Failed to update job', 'error')
    } finally {
      setSaving(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-red-500" />
      case 'in_progress':
        return <Clock className="w-5 h-5 text-blue-500" />
      case 'assigned':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />
      default:
        return <Clock className="w-5 h-5 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'assigned':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading job details...</p>
        </div>
      </div>
    )
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Job Not Found</h1>
          <p className="text-gray-600 mb-6">{error || 'The requested job could not be found.'}</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Job #{job.job_id}</h1>
              <div className="flex items-center mt-2">
                {getStatusIcon(job.status)}
                <span className={`ml-2 px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(job.status)}`}>
                  {job.status.replace('_', ' ').toUpperCase()}
                </span>
              </div>
            </div>
            
            <button
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Customer Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <User className="w-5 h-5 mr-2 text-blue-600" />
              Customer Information
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <p className="text-gray-900 font-medium">{job.customer_name}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <div className="flex items-center">
                  <Phone className="w-4 h-4 mr-2 text-gray-400" />
                  <p className="text-gray-900">{job.customer_phone}</p>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <div className="flex items-start">
                  <MapPin className="w-4 h-4 mr-2 text-gray-400 mt-1" />
                  <p className="text-gray-900">{job.customer_address}</p>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Issue Description</label>
                <div className="flex items-start">
                  <FileText className="w-4 h-4 mr-2 text-gray-400 mt-1" />
                  <p className="text-gray-900">{job.customer_issue}</p>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Created</label>
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                  <p className="text-gray-900">
                    {new Date(job.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Job Details */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <FileText className="w-5 h-5 mr-2 text-blue-600" />
              Job Details
            </h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="pending">Pending</option>
                  <option value="assigned">Assigned</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Assigned Subcontractor</label>
                <select
                  value={selectedSubcontractorId}
                  onChange={(e) => setSelectedSubcontractorId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Unassigned</option>
                  {subcontractors.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.name} - {sub.region}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Materials Used</label>
                <textarea
                  value={formData.materials}
                  onChange={(e) => handleInputChange('materials', e.target.value)}
                  placeholder="List materials and parts used..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Parts Cost</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="number"
                      step="0.01"
                      value={formData.parts_cost}
                      onChange={(e) => handleInputChange('parts_cost', e.target.value)}
                      placeholder="0.00"
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sale Price</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => handleInputChange('price', e.target.value)}
                      placeholder="0.00"
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Profit</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="number"
                      step="0.01"
                      value={formData.job_profit}
                      onChange={(e) => handleInputChange('job_profit', e.target.value)}
                      placeholder="0.00"
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="Additional notes about the job..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={4}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default JobView