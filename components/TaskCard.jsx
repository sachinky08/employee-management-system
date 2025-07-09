"use client"

import { useState } from "react"

export default function TaskCard({ task, onStatusChange, isEmployee = false }) {
  const [updating, setUpdating] = useState(false)

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "in-progress":
        return "bg-blue-100 text-blue-800"
      case "completed":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handleStatusChange = async (newStatus) => {
    if (!onStatusChange) return

    setUpdating(true)
    try {
      await onStatusChange(task._id, newStatus)
    } catch (error) {
      console.error("Error updating task status:", error)
    } finally {
      setUpdating(false)
    }
  }

  return (
    <div className="card">
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-lg font-semibold text-gray-900">{task.title}</h3>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
          {task.status.replace("-", " ").toUpperCase()}
        </span>
      </div>

      <p className="text-gray-600 mb-4">{task.description}</p>

      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-500">
          {isEmployee ? (
            <span>Assigned by: {task.assignedBy?.name || "Unknown"}</span>
          ) : (
            <span>
              Assigned to: {task.assignedTo?.name || "Unknown"} ({task.assignedTo?.employeeId || "N/A"})
            </span>
          )}
        </div>

        {isEmployee && task.status !== "completed" && (
          <div className="flex space-x-2">
            {task.status === "pending" && (
              <button
                onClick={() => handleStatusChange("in-progress")}
                disabled={updating}
                className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded transition-colors disabled:opacity-50"
              >
                {updating ? "..." : "Start"}
              </button>
            )}
            {task.status === "in-progress" && (
              <button
                onClick={() => handleStatusChange("completed")}
                disabled={updating}
                className="text-sm bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded transition-colors disabled:opacity-50"
              >
                {updating ? "..." : "Complete"}
              </button>
            )}
          </div>
        )}
      </div>

      <div className="mt-3 text-xs text-gray-400">
        Created: {task.createdAt ? new Date(task.createdAt).toLocaleDateString() : "Unknown"}
      </div>
    </div>
  )
}
