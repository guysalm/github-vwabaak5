import React, { useState } from 'react'
import { X, UserCheck, User } from 'lucide-react'
import { useSubcontractors } from '../hooks/useSubcontractors'
import { Job } from '../types'

interface EditSubcontractorModalProps {
  isOpen: boolean
  onClose: () => void
  job: Job
  onUpdateSubcontractor: (jobId: string, subcontractorId: string | null) => void
  loading?: boolean
}

const EditSubcontractorModal: React.FC<EditSubcontractorModalProps> = ({
  isOpen,
  onClose,
  job,
  onUpdateSubcontractor,
  loading = false
}) => {
  const { subcontractors } = useSubcontractors()
  const [selectedSubcontractorId, setSelectedSubcontractorId] = useState<string | null>(
    job.subcontractor_id
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onUpdateSubcontractor(job.id, selectedSubcontractorId)
  }

  const currentSubcontractor = subcontractors.find(s => s.id === job.subcontractor_id)
  const selectedSubcontractor = subcontractors.find(s => s.id === selectedSubcontractorId)

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
            <UserCheck className="h-6 w-6 text-blue-600" />
            <span>Change Subcontractor</span>
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Job: {job.job_id}</h3>
            <p className="text-gray-600">Customer: {job.customer_name}</p>
            <p className="text-gray-600">Address: {job.customer_address}</p>
          </div>

          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Current Assignment</h4>
            <div className="bg-gray-50 p-3 rounded-lg">
              {currentSubcontractor ? (
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="font-medium text-gray-900">{currentSubcontractor.name}</p>
                    <p className="text-sm text-gray-600">{currentSubcontractor.region}</p>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 italic">No subcontractor assigned</p>
              )}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Subcontractor Assignment
              </label>
              <select
                value={selectedSubcontractorId || ''}
                onChange={(e) => setSelectedSubcontractorId(e.target.value || null)}
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

            {selectedSubcontractor && selectedSubcontractor.id !== job.subcontractor_id && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <h5 className="font-medium text-blue-900 mb-2">📋 New Assignment Preview</h5>
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-blue-600" />
                  <div>
                    <p className="font-medium text-blue-900">{selectedSubcontractor.name}</p>
                    <p className="text-sm text-blue-700">{selectedSubcontractor.region}</p>
                    <p className="text-sm text-blue-700">{selectedSubcontractor.phone}</p>
                  </div>
                </div>
                <div className="mt-2 text-xs text-blue-600">
                  💬 WhatsApp notification will be sent automatically
                </div>
              </div>
            )}

            {selectedSubcontractorId === '' && job.subcontractor_id && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                <h5 className="font-medium text-orange-900 mb-1">⚠️ Unassigning Subcontractor</h5>
                <p className="text-sm text-orange-700">
                  This will remove the current subcontractor assignment from this job.
                </p>
              </div>
            )}

            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || selectedSubcontractorId === job.subcontractor_id}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 min-h-[44px]"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Updating...</span>
                  </>
                ) : (
                  <>
                    <UserCheck className="h-4 w-4" />
                    <span>
                      {selectedSubcontractorId === job.subcontractor_id 
                        ? 'No Change' 
                        : selectedSubcontractorId 
                          ? 'Assign Subcontractor' 
                          : 'Remove Assignment'
                      }
                    </span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default EditSubcontractorModal