import React, { useState } from 'react'
import { format } from 'date-fns'
import { MapPin, User, DollarSign, FileText, ExternalLink, Check, Trash2, UserCheck } from 'lucide-react'
import { Job } from '../types'
import { getStatusColor, formatPhoneNumber } from '../utils/jobUtils'

interface JobCardProps {
  job: Job
  onViewDetails: (job: Job) => void
  onSendWhatsApp?: (job: Job) => void
  onEditSubcontractor?: (job: Job) => void
  onDeleteJob?: (job: Job) => void
  showSubcontractorLink?: boolean
  isAdmin?: boolean
  deleteLoading?: string | null
  updateLoading?: string | null
}

const JobCard: React.FC<JobCardProps> = ({ 
  job, 
  onViewDetails, 
  onSendWhatsApp,
  onEditSubcontractor,
  onDeleteJob,
  showSubcontractorLink = true,
  isAdmin = false,
  deleteLoading = null,
  updateLoading = null
}) => {
  const [copyStatus, setCopyStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const handleWhatsAppClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onSendWhatsApp) {
      onSendWhatsApp(job)
    }
  }

  const handleCopyPublicLink = (e: React.MouseEvent) => {
    e.stopPropagation()
    
    // Generate the proper React route URL that works across all environments
    const generatePublicUrl = () => {
      const protocol = window.location.protocol
      const hostname = window.location.hostname
      const port = window.location.port
      
      // Build the base URL
      let baseUrl
      if (port && port !== '80' && port !== '443') {
        baseUrl = `${protocol}//${hostname}:${port}`
      } else {
        baseUrl = `${protocol}//${hostname}`
      }
      
      // Use the React route instead of the static HTML file
      return `${baseUrl}/job/${job.job_id}`
    }
    
    const publicLink = generatePublicUrl()
    
    // Try to copy to clipboard
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(publicLink).then(() => {
        setCopyStatus('success')
        setTimeout(() => setCopyStatus('idle'), 2000)
      }).catch(err => {
        console.error('Failed to copy link:', err)
        showFallbackCopy(publicLink)
      })
    } else {
      // Fallback for browsers that don't support clipboard API
      showFallbackCopy(publicLink)
    }
  }

  const showFallbackCopy = (fallbackLink: string) => {
    // Show fallback - display the link in an alert or prompt
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
      const message = `Copy this link to share the job:\n\n${fallbackLink}`
      alert(message)
    } else {
      // For desktop, try to select the text
      const textArea = document.createElement('textarea')
      textArea.value = fallbackLink
      document.body.appendChild(textArea)
      textArea.select()
      
      try {
        document.execCommand('copy')
        setCopyStatus('success')
        setTimeout(() => setCopyStatus('idle'), 2000)
      } catch (err) {
        alert(`Copy this link to share the job:\n\n${fallbackLink}`)
      }
      
      document.body.removeChild(textArea)
    }
  }

  const getCopyButtonContent = () => {
    switch (copyStatus) {
      case 'success':
        return <Check className="h-4 w-4" />
      case 'error':
        return <ExternalLink className="h-4 w-4" />
      default:
        return <ExternalLink className="h-4 w-4" />
    }
  }

  const getCopyButtonClasses = () => {
    const baseClasses = "px-3 py-2 border rounded-lg text-sm font-medium transition-colors flex items-center justify-center min-w-[44px]"
    
    switch (copyStatus) {
      case 'success':
        return `${baseClasses} bg-green-50 text-green-600 border-green-200`
      case 'error':
        return `${baseClasses} bg-red-50 text-red-600 border-red-200`
      default:
        return `${baseClasses} border-gray-300 text-gray-700 hover:bg-gray-50`
    }
  }

  const handleCardClick = (e: React.MouseEvent) => {
    // Prevent double-clicking and ensure only one navigation happens
    e.preventDefault()
    e.stopPropagation()
    
    console.log('Job card clicked for:', job.job_id)
    onViewDetails(job)
  }

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setShowDeleteConfirm(true)
  }

  const confirmDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onDeleteJob) {
      onDeleteJob(job)
    }
    setShowDeleteConfirm(false)
  }

  const cancelDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    setShowDeleteConfirm(false)
  }

  const handleEditSubcontractorClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onEditSubcontractor) {
      onEditSubcontractor(job)
    }
  }

  return (
    <div 
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200 cursor-pointer"
      onClick={handleCardClick}
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          {isAdmin && (
            <div className="flex items-center space-x-1 mb-2">
              <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                🔧 Admin View
              </div>
            </div>
          )}
          <h3 className="text-lg font-semibold text-gray-900">{job.job_id}</h3>
          <p className="text-sm text-gray-500">
            {format(new Date(job.created_at), 'MMM dd, yyyy • h:mm a')}
          </p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(job.status)}`}>
          {job.status.charAt(0).toUpperCase() + job.status.slice(1).replace('_', ' ')}
        </span>
      </div>

      <div className="space-y-3">
        <div className="flex items-center space-x-3">
          <User className="h-4 w-4 text-gray-400 flex-shrink-0" />
          <div>
            <p className="font-medium text-gray-900">{job.customer_name}</p>
            <p className="text-sm text-gray-500">{formatPhoneNumber(job.customer_phone)}</p>
          </div>
        </div>

        <div className="flex items-start space-x-3">
          <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-gray-600 line-clamp-2">{job.customer_address}</p>
        </div>

        {job.subcontractor && (
          <div className="flex items-center space-x-3">
            <User className="h-4 w-4 text-blue-500 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-gray-900">{job.subcontractor.name}</p>
              <p className="text-xs text-gray-500">{job.subcontractor.region}</p>
            </div>
          </div>
        )}

        {job.price && (
          <div className="flex items-center space-x-3">
            <DollarSign className="h-4 w-4 text-green-500 flex-shrink-0" />
            <p className="text-sm font-medium text-gray-900">${job.price.toFixed(2)}</p>
          </div>
        )}

        {job.customer_issue && (
          <div className="flex items-start space-x-3">
            <FileText className="h-4 w-4 text-gray-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-gray-600 line-clamp-2">{job.customer_issue}</p>
          </div>
        )}
      </div>

      {/* Admin Actions */}
      {isAdmin && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs text-gray-500 font-medium">🔧 Admin Actions</span>
            <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
              Admin Only
            </div>
          </div>
          
          {/* Admin Action Buttons */}
          <div className="flex flex-col space-y-2">
            {onEditSubcontractor && (
              <button
                onClick={handleEditSubcontractorClick}
                disabled={updateLoading === job.id}
                className="w-full bg-blue-50 text-blue-700 px-3 py-2 rounded-lg text-xs font-medium hover:bg-blue-100 transition-colors flex items-center justify-center space-x-1 border border-blue-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {updateLoading === job.id ? (
                  <>
                    <div className="animate-spin rounded-full h-3 w-3 border border-blue-600 border-t-transparent"></div>
                    <span>Updating...</span>
                  </>
                ) : (
                  <>
                    <UserCheck className="h-3 w-3" />
                    <span>Change Subcontractor</span>
                  </>
                )}
              </button>
            )}
            
            {onDeleteJob && (
              <button
                onClick={handleDeleteClick}
                disabled={deleteLoading === job.id}
                className="w-full bg-red-50 text-red-700 px-3 py-2 rounded-lg text-xs font-medium hover:bg-red-100 transition-colors flex items-center justify-center space-x-1 border border-red-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleteLoading === job.id ? (
                  <>
                    <div className="animate-spin rounded-full h-3 w-3 border border-red-600 border-t-transparent"></div>
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="h-3 w-3" />
                    <span>Delete Job</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      )}

      {showSubcontractorLink && job.subcontractor && (
        <div className="mt-4 pt-4 border-t border-gray-100 flex space-x-2">
          <button
            onClick={handleWhatsAppClick}
            className="flex-1 bg-green-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
          >
            Send WhatsApp
          </button>
          <button
            onClick={handleCopyPublicLink}
            className={getCopyButtonClasses()}
            title="Copy public job link for subcontractor"
          >
            {getCopyButtonContent()}
          </button>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={cancelDelete}>
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-red-100 p-2 rounded-full">
                <Trash2 className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Delete Job</h3>
                <p className="text-sm text-gray-500">This action cannot be undone</p>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <p className="text-sm font-medium text-gray-900 mb-2">Job Details:</p>
              <p className="text-sm text-gray-700">ID: {job.job_id}</p>
              <p className="text-sm text-gray-700">Customer: {job.customer_name}</p>
              <p className="text-sm text-gray-700">Status: {job.status.replace('_', ' ')}</p>
            </div>
            
            <p className="text-gray-600 mb-6 text-sm">
              Are you sure you want to permanently delete this job? All associated data including updates and history will be removed.
            </p>
            
            <div className="flex space-x-3">
              <button
                onClick={cancelDelete}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center justify-center space-x-2"
              >
                <Trash2 className="h-4 w-4" />
                <span>Delete Job</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default JobCard