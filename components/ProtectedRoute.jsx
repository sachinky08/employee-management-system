"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Cookies from "js-cookie"

// Client-side token verification function
function verifyTokenClient(token) {
  try {
    if (!token) return null

    const parts = token.split(".")
    if (parts.length !== 3) return null

    const base64Url = parts[1]
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/")
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join(""),
    )

    const decoded = JSON.parse(jsonPayload)

    // Check if token is expired
    if (decoded.exp && decoded.exp < Date.now() / 1000) {
      console.log("Token expired")
      return null
    }

    // Ensure all required fields are present
    if (!decoded.userId || !decoded.email || !decoded.role || !decoded.department) {
      console.log("Token missing required fields:", decoded)
      return null
    }

    // Ensure employeeId is present (add fallback if missing)
    if (!decoded.employeeId) {
      decoded.employeeId = "TEMP001"
    }

    return decoded
  } catch (error) {
    console.error("Client token verification error:", error)
    return null
  }
}

export default function ProtectedRoute({ children, requiredRole }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const router = useRouter()

  useEffect(() => {
    console.log("🔐 ProtectedRoute: Checking authentication...")

    const token = Cookies.get("token")
    console.log("Token exists:", !!token)

    if (!token) {
      console.log("❌ No token found, redirecting to login")
      router.push("/login")
      return
    }

    const decoded = verifyTokenClient(token)
    console.log("Decoded token:", decoded)

    if (!decoded) {
      console.log("❌ Invalid token, clearing and redirecting")
      Cookies.remove("token")
      router.push("/login")
      return
    }

    if (requiredRole && decoded.role !== requiredRole) {
      console.log(`❌ Role mismatch. Required: ${requiredRole}, Got: ${decoded.role}`)
      // Redirect to appropriate dashboard based on actual role
      if (decoded.role === "manager") {
        router.push("/manager-dashboard")
      } else if (decoded.role === "employee") {
        router.push("/employee-dashboard")
      } else {
        router.push("/login")
      }
      return
    }

    console.log("✅ Authentication successful for:", decoded.email)
    setUser(decoded)
    setLoading(false)
  }, [router, requiredRole])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-gray-600">Verifying authentication...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="card max-w-md">
          <h2 className="text-xl font-semibold text-red-600 mb-2">Authentication Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button onClick={() => router.push("/login")} className="btn-primary">
            Go to Login
          </button>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return children(user)
}
