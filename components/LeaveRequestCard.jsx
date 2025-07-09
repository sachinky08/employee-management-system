"use client"

import { useState } from "react"

export default function LeaveRequestCard({ request, onStatusChange, isManager = false }) {
  const [updating, setUpdating] = useState(false)

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "approved":
        return "bg-green-100 text-green-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handleStatusChange = async (newStatus) => {
    if (!onStatusChange) return

    setUpdating(true)
    try {
      await onStatusChange(request._id, newStatus)
    } catch (error) {
      console.error("Error updating leave request:", error)
    } finally {
      setUpdating(false)
    }
  }

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString()
    } catch (error) {
      return "Invalid Date"
    }
  }

  return (
    <div className="card">
      <div className="flex justify-between items-start mb-3">
        <div>
          {isManager && (
            <h3 className="text-lg font-semibold text-gray-900">
              {request.employeeId?.name || "Unknown Employee"} ({request.employeeId?.employeeId || "N/A"})
            </h3>
          )}
          <div className="text-sm text-gray-600">
            {formatDate(request.startDate)} - {formatDate(request.endDate)}
          </div>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
          {request.status.toUpperCase()}
        </span>
      </div>

      <p className="text-gray-700 mb-4">
        <span className="font-medium">Reason:</span> {request.reason}
      </p>

      {isManager && request.status === "pending" && (
        <div className="flex space-x-2">
          <button
            onClick={() => handleStatusChange("approved")}
            disabled={updating}
            className="btn-primary text-sm disabled:opacity-50"
          >
            {updating ? "..." : "Approve"}
          </button>
          <button
            onClick={() => handleStatusChange("rejected")}
            disabled={updating}
            className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm disabled:opacity-50"
          >
            {updating ? "..." : "Reject"}
          </button>
        </div>
      )}

      <div className="mt-3 text-xs text-gray-400">
        Submitted: {request.createdAt ? formatDate(request.createdAt) : "Unknown"}
      </div>
    </div>
  )
}
