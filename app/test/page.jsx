"use client"

import { useState } from "react"

export default function TestPage() {
  const [dbStatus, setDbStatus] = useState(null)
  const [loading, setLoading] = useState(false)
  const [testResults, setTestResults] = useState([])

  const addTestResult = (test, success, message, data = null) => {
    setTestResults((prev) => [
      ...prev,
      {
        test,
        success,
        message,
        data,
        timestamp: new Date().toLocaleTimeString(),
      },
    ])
  }

  const testDatabase = async () => {
    setLoading(true)
    try {
      console.log("🧪 Testing database connection...")
      const response = await fetch("/api/test-db")
      const data = await response.json()

      if (response.ok) {
        setDbStatus(data)
        addTestResult("Database Connection", true, "Connected successfully", data)
      } else {
        addTestResult("Database Connection", false, data.error || "Connection failed", data)
      }
    } catch (error) {
      console.error("Database test error:", error)
      addTestResult("Database Connection", false, "Network error", { error: error.message })
    } finally {
      setLoading(false)
    }
  }

  const testRegistration = async () => {
    const testUser = {
      name: "Test User",
      email: `test-${Date.now()}@example.com`,
      password: "password123",
      role: "employee",
      department: "Engineering",
    }

    try {
      console.log("🧪 Testing user registration...")
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(testUser),
      })

      const data = await response.json()

      if (response.ok) {
        addTestResult("User Registration", true, "User created successfully", {
          email: data.user.email,
          employeeId: data.user.employeeId,
          role: data.user.role,
        })
      } else {
        addTestResult("User Registration", false, data.error || "Registration failed", data)
      }
    } catch (error) {
      console.error("Registration test error:", error)
      addTestResult("User Registration", false, "Network error", { error: error.message })
    }
  }

  const testLogin = async () => {
    // First create a test user, then try to login
    const testUser = {
      name: "Login Test User",
      email: `login-test-${Date.now()}@example.com`,
      password: "password123",
      role: "manager",
      department: "Finance",
    }

    try {
      console.log("🧪 Creating user for login test...")
      const registerResponse = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(testUser),
      })

      if (!registerResponse.ok) {
        addTestResult("Login Test", false, "Failed to create test user")
        return
      }

      console.log("🧪 Testing login...")
      const loginResponse = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: testUser.email,
          password: testUser.password,
        }),
      })

      const loginData = await loginResponse.json()

      if (loginResponse.ok) {
        addTestResult("Login Test", true, "Login successful", {
          email: loginData.user.email,
          role: loginData.user.role,
          hasToken: !!loginData.token,
        })
      } else {
        addTestResult("Login Test", false, loginData.error || "Login failed", loginData)
      }
    } catch (error) {
      console.error("Login test error:", error)
      addTestResult("Login Test", false, "Network error", { error: error.message })
    }
  }

  const createTestManager = async () => {
    try {
      const response = await fetch("/api/test-db", {
        method: "POST",
      })

      const data = await response.json()

      if (response.ok) {
        addTestResult("Create Test Manager", true, "Test manager created", data.user)
      } else {
        addTestResult("Create Test Manager", false, data.error || "Failed to create manager", data)
      }
    } catch (error) {
      addTestResult("Create Test Manager", false, "Network error", { error: error.message })
    }
  }

  const clearResults = () => {
    setTestResults([])
    setDbStatus(null)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="card">
          <h1 className="text-3xl font-bold mb-6">🧪 System Test Dashboard</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <button onClick={testDatabase} disabled={loading} className="btn-primary">
              {loading ? "Testing..." : "Test Database"}
            </button>

            <button onClick={testRegistration} className="btn-secondary">
              Test Registration
            </button>

            <button onClick={testLogin} className="btn-secondary">
              Test Login Flow
            </button>

            <button onClick={createTestManager} className="btn-secondary">
              Create Test Manager
            </button>
          </div>

          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Test Results</h2>
            <button onClick={clearResults} className="text-sm text-gray-600 hover:text-gray-800">
              Clear Results
            </button>
          </div>

          {testResults.length === 0 ? (
            <div className="text-center text-gray-500 py-8">No tests run yet. Click a test button above to start.</div>
          ) : (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {testResults.map((result, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border ${
                    result.success
                      ? "bg-green-50 border-green-200 text-green-800"
                      : "bg-red-50 border-red-200 text-red-800"
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold">
                      {result.success ? "✅" : "❌"} {result.test}
                    </h3>
                    <span className="text-xs opacity-75">{result.timestamp}</span>
                  </div>
                  <p className="text-sm mb-2">{result.message}</p>
                  {result.data && (
                    <details className="text-xs">
                      <summary className="cursor-pointer">View Details</summary>
                      <pre className="mt-2 p-2 bg-white bg-opacity-50 rounded overflow-x-auto">
                        {JSON.stringify(result.data, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">Environment Status:</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>✅ MONGODB_URI: {process.env.MONGODB_URI ? "Configured" : "❌ Missing"}</li>
              <li>✅ JWT_SECRET: {process.env.JWT_SECRET ? "Configured" : "❌ Missing"}</li>
            </ul>
          </div>

          <div className="mt-6">
            <h3 className="font-semibold mb-4">Quick Navigation:</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
              <a href="/register" className="text-blue-600 hover:underline">
                → Register
              </a>
              <a href="/login" className="text-blue-600 hover:underline">
                → Login
              </a>
              <a href="/manager-dashboard" className="text-blue-600 hover:underline">
                → Manager Dashboard
              </a>
              <a href="/employee-dashboard" className="text-blue-600 hover:underline">
                → Employee Dashboard
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
