"use client"

import { useState, useEffect } from "react"
import Cookies from "js-cookie"
import Header from "@/components/Header"
import ProtectedRoute from "@/components/ProtectedRoute"
import TaskCard from "@/components/TaskCard"
import LeaveRequestCard from "@/components/LeaveRequestCard"

export default function ManagerDashboard() {
  const [employees, setEmployees] = useState([])
  const [tasks, setTasks] = useState([])
  const [leaveRequests, setLeaveRequests] = useState([])
  const [workloadStatus, setWorkloadStatus] = useState("")
  const [activeTab, setActiveTab] = useState("overview")
  const [taskForm, setTaskForm] = useState({
    title: "",
    description: "",
    assignedTo: "",
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

      // Fetch employees
      const employeesRes = await fetch("/api/employees", { headers })
      if (employeesRes.ok) {
        const employeesData = await employeesRes.json()
        setEmployees(employeesData.employees || [])
      }

      // Fetch tasks
      const tasksRes = await fetch("/api/tasks/list", { headers })
      if (tasksRes.ok) {
        const tasksData = await tasksRes.json()
        setTasks(tasksData.tasks || [])
      }

      // Fetch leave requests
      const leaveRes = await fetch("/api/leave/manage", { headers })
      if (leaveRes.ok) {
        const leaveData = await leaveRes.json()
        setLeaveRequests(leaveData.leaveRequests || [])
      }

      // Fetch workload prediction
      const workloadRes = await fetch("/api/predict-load", { headers })
      if (workloadRes.ok) {
        const workloadData = await workloadRes.json()
        setWorkloadStatus(workloadData.status || "Normal")
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

  const handleTaskSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")

    const token = Cookies.get("token")

    try {
      const response = await fetch("/api/tasks/assign", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(taskForm),
      })

      const data = await response.json()

      if (response.ok) {
        setTaskForm({ title: "", description: "", assignedTo: "" })
        setSuccess("Task assigned successfully!")
        fetchData() // Refresh data
      } else {
        setError(data.error || "Failed to assign task")
      }
    } catch (error) {
      console.error("Error assigning task:", error)
      setError("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleLeaveStatusChange = async (requestId, status) => {
    const token = Cookies.get("token")

    try {
      const response = await fetch("/api/leave/manage", {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ requestId, status }),
      })

      if (response.ok) {
        fetchData() // Refresh data
      } else {
        const data = await response.json()
        setError(data.error || "Failed to update leave request")
      }
    } catch (error) {
      console.error("Error updating leave request:", error)
      setError("Network error. Please try again.")
    }
  }

  const getWorkloadColor = (status) => {
    switch (status) {
      case "Normal":
        return "bg-green-100 text-green-800"
      case "Moderate":
        return "bg-yellow-100 text-yellow-800"
      case "Overloaded":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
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
    <ProtectedRoute requiredRole="manager">
      {(user) => (
        <div className="min-h-screen bg-gray-50">
          <Header user={user} />

          <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <div className="px-4 py-6 sm:px-0">
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Manager Dashboard</h1>
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

              {/* Workload Status */}
              <div className="mb-6">
                <div className="card">
                  <h3 className="text-lg font-semibold mb-2">Department Workload Status</h3>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getWorkloadColor(workloadStatus)}`}>
                    {workloadStatus || "Loading..."}
                  </span>
                </div>
              </div>

              {/* Navigation Tabs */}
              <div className="mb-6">
                <nav className="flex space-x-8">
                  {["overview", "assign-task", "tasks", "leave-requests"].map((tab) => (
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
              {activeTab === "overview" && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="card">
                    <h3 className="text-lg font-semibold mb-2">Total Employees</h3>
                    <p className="text-3xl font-bold text-blue-600">{employees.length}</p>
                  </div>
                  <div className="card">
                    <h3 className="text-lg font-semibold mb-2">Active Tasks</h3>
                    <p className="text-3xl font-bold text-blue-600">
                      {tasks.filter((t) => t.status !== "completed").length}
                    </p>
                  </div>
                  <div className="card">
                    <h3 className="text-lg font-semibold mb-2">Pending Leave Requests</h3>
                    <p className="text-3xl font-bold text-blue-600">
                      {leaveRequests.filter((r) => r.status === "pending").length}
                    </p>
                  </div>
                </div>
              )}

              {activeTab === "assign-task" && (
                <div className="max-w-2xl">
                  <div className="card">
                    <h3 className="text-lg font-semibold mb-4">Assign New Task</h3>
                    <form onSubmit={handleTaskSubmit} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Task Title</label>
                        <input
                          type="text"
                          required
                          className="input-field"
                          value={taskForm.title}
                          onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                          placeholder="Enter task title"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea
                          required
                          rows={3}
                          className="input-field"
                          value={taskForm.description}
                          onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                          placeholder="Enter task description"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Assign to Employee</label>
                        <select
                          required
                          className="input-field"
                          value={taskForm.assignedTo}
                          onChange={(e) => setTaskForm({ ...taskForm, assignedTo: e.target.value })}
                        >
                          <option value="">Select an employee</option>
                          {employees.map((emp) => (
                            <option key={emp._id} value={emp._id}>
                              {emp.name} ({emp.employeeId})
                            </option>
                          ))}
                        </select>
                      </div>

                      <button type="submit" disabled={loading} className="btn-primary">
                        {loading ? "Assigning..." : "Assign Task"}
                      </button>
                    </form>
                  </div>
                </div>
              )}

              {activeTab === "tasks" && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Department Tasks</h3>
                  {tasks.length === 0 ? (
                    <div className="card text-center text-gray-500">No tasks assigned yet.</div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {tasks.map((task) => (
                        <TaskCard key={task._id} task={task} />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === "leave-requests" && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Leave Requests</h3>
                  {leaveRequests.length === 0 ? (
                    <div className="card text-center text-gray-500">No leave requests to review.</div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {leaveRequests.map((request) => (
                        <LeaveRequestCard
                          key={request._id}
                          request={request}
                          onStatusChange={handleLeaveStatusChange}
                          isManager={true}
                        />
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
