"use client"

import { useState, useEffect } from "react"
import Cookies from "js-cookie"
import Header from "@/components/Header"
import ProtectedRoute from "@/components/ProtectedRoute"
import TaskCard from "@/components/TaskCard"
import LeaveRequestCard from "@/components/LeaveRequestCard"

export default function EmployeeDashboard() {
  const [tasks, setTasks] = useState([])
  const [leaveRequests, setLeaveRequests] = useState([])
  const [activeTab, setActiveTab] = useState("profile")
  const [leaveForm, setLeaveForm] = useState({
    reason: "",
    startDate: "",
    endDate: "",
  })
  const [loading, setLoading] = useState(false)
  const [dataLoading, setDataLoading] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const fetchData = async () => {
    const token = Cookies.get("token")
    if (!token) return

    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    }

    try {
      setDataLoading(true)
      setError("")

      // Fetch tasks
      const tasksRes = await fetch("/api/tasks/list", { headers })
      if (tasksRes.ok) {
        const tasksData = await tasksRes.json()
        setTasks(tasksData.tasks || [])
      }

      // Fetch leave requests
      const leaveRes = await fetch("/api/leave/request", { headers })
      if (leaveRes.ok) {
        const leaveData = await leaveRes.json()
        setLeaveRequests(leaveData.leaveRequests || [])
      }
    } catch (error) {
      console.error("Error fetching data:", error)
      setError("Failed to load dashboard data")
    } finally {
      setDataLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleTaskStatusChange = async (taskId, status) => {
    const token = Cookies.get("token")

    try {
      const response = await fetch("/api/tasks/list", {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ taskId, status }),
      })

      if (response.ok) {
        fetchData() // Refresh data
      } else {
        const data = await response.json()
        setError(data.error || "Failed to update task")
      }
    } catch (error) {
      console.error("Error updating task:", error)
      setError("Network error. Please try again.")
    }
  }

  const handleLeaveSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")

    // Validate dates
    const startDate = new Date(leaveForm.startDate)
    const endDate = new Date(leaveForm.endDate)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (startDate < today) {
      setError("Start date cannot be in the past")
      setLoading(false)
      return
    }

    if (endDate < startDate) {
      setError("End date cannot be before start date")
      setLoading(false)
      return
    }

    const token = Cookies.get("token")

    try {
      const response = await fetch("/api/leave/request", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(leaveForm),
      })

      const data = await response.json()

      if (response.ok) {
        setLeaveForm({ reason: "", startDate: "", endDate: "" })
        setSuccess("Leave request submitted successfully!")
        fetchData() // Refresh data
      } else {
        setError(data.error || "Failed to submit leave request")
      }
    } catch (error) {
      console.error("Error submitting leave request:", error)
      setError("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (dataLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <ProtectedRoute requiredRole="employee">
      {(user) => (
        <div className="min-h-screen bg-gray-50">
          <Header user={user} />

          <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <div className="px-4 py-6 sm:px-0">
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Employee Dashboard</h1>
                <p className="text-gray-600">Welcome back, {user.name}</p>
              </div>

              {/* Error/Success Messages */}
              {error && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">{error}</div>
              )}
              {success && (
                <div className="mb-4 bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg">
                  {success}
                </div>
              )}

              {/* Navigation Tabs */}
              <div className="mb-6">
                <nav className="flex space-x-8">
                  {["profile", "tasks", "leave-request", "leave-history"].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                        activeTab === tab
                          ? "border-blue-500 text-blue-600"
                          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                      }`}
                    >
                      {tab.replace("-", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                    </button>
                  ))}
                </nav>
              </div>

              {/* Tab Content */}
              {activeTab === "profile" && (
                <div className="max-w-2xl">
                  <div className="card">
                    <h3 className="text-lg font-semibold mb-4">Profile Information</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-700">Name:</span>
                        <span className="text-gray-900">{user.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-700">Employee ID:</span>
                        <span className="text-gray-900 font-mono">{user.employeeId}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-700">Email:</span>
                        <span className="text-gray-900">{user.email}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-700">Department:</span>
                        <span className="text-gray-900">{user.department}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-700">Role:</span>
                        <span className="text-gray-900 capitalize">{user.role}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "tasks" && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">My Tasks</h3>
                    <div className="text-sm text-gray-600">{tasks.length} total tasks</div>
                  </div>
                  {tasks.length === 0 ? (
                    <div className="card text-center text-gray-500">No tasks assigned yet.</div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {tasks.map((task) => (
                        <TaskCard
                          key={task._id}
                          task={task}
                          onStatusChange={handleTaskStatusChange}
                          isEmployee={true}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === "leave-request" && (
                <div className="max-w-2xl">
                  <div className="card">
                    <h3 className="text-lg font-semibold mb-4">Submit Leave Request</h3>
                    <form onSubmit={handleLeaveSubmit} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Reason for Leave</label>
                        <textarea
                          required
                          rows={3}
                          className="input-field"
                          placeholder="Please provide a reason for your leave request"
                          value={leaveForm.reason}
                          onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                          <input
                            type="date"
                            required
                            className="input-field"
                            value={leaveForm.startDate}
                            onChange={(e) => setLeaveForm({ ...leaveForm, startDate: e.target.value })}
                            min={new Date().toISOString().split("T")[0]}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                          <input
                            type="date"
                            required
                            className="input-field"
                            value={leaveForm.endDate}
                            onChange={(e) => setLeaveForm({ ...leaveForm, endDate: e.target.value })}
                            min={leaveForm.startDate || new Date().toISOString().split("T")[0]}
                          />
                        </div>
                      </div>

                      <button type="submit" disabled={loading} className="btn-primary">
                        {loading ? "Submitting..." : "Submit Leave Request"}
                      </button>
                    </form>
                  </div>
                </div>
              )}

              {activeTab === "leave-history" && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Leave Request History</h3>
                  {leaveRequests.length === 0 ? (
                    <div className="card text-center text-gray-500">No leave requests submitted yet.</div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {leaveRequests.map((request) => (
                        <LeaveRequestCard key={request._id} request={request} isManager={false} />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </ProtectedRoute>
  )
}
