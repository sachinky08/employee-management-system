"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import Cookies from "js-cookie"

export default function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [message, setMessage] = useState("")
  const [validationErrors, setValidationErrors] = useState({})
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const messageParam = searchParams.get("message")
    if (messageParam) {
      setMessage(messageParam)
    }
  }, [searchParams])

  const validateForm = () => {
    const errors = {}

    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Please enter a valid email address"
    }

    if (!formData.password || formData.password.length < 1) {
      errors.password = "Password is required"
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    // Clear validation error when user starts typing
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({
        ...prev,
        [name]: "",
      }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    console.log("🚀 Login form submitted")

    if (!validateForm()) {
      console.log("❌ Form validation failed")
      return
    }

    setLoading(true)
    setError("")
    setMessage("")

    try {
      console.log("📤 Sending login request for:", formData.email)
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()
      console.log("📥 Login response:", { ...data, token: data.token ? "[TOKEN]" : undefined })

      if (response.ok) {
        console.log("✅ Login successful")

        // Store token in cookie
        Cookies.set("token", data.token, {
          expires: 7,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
        })

        console.log("🍪 Token stored in cookie")
        console.log("👤 User role:", data.user.role)

        // Redirect based on role
        if (data.user.role === "manager") {
          console.log("🔄 Redirecting to manager dashboard")
          router.push("/manager-dashboard")
        } else if (data.user.role === "employee") {
          console.log("🔄 Redirecting to employee dashboard")
          router.push("/employee-dashboard")
        } else {
          console.log("❌ Unknown role:", data.user.role)
          setError("Invalid user role")
        }
      } else {
        console.log("❌ Login failed:", data.error)
        setError(data.error || "Login failed")
      }
    } catch (error) {
      console.error("❌ Login network error:", error)
      setError("Network error. Please check your connection and try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Sign in to your account</h2>
          <p className="mt-2 text-center text-sm text-gray-600">Access your employee dashboard</p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {message && (
            <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg">{message}</div>
          )}

          {error && <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">{error}</div>}

          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address *
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className={`input-field ${validationErrors.email ? "border-red-500" : ""}`}
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
              />
              {validationErrors.email && <p className="mt-1 text-sm text-red-600">{validationErrors.email}</p>}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password *
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className={`input-field ${validationErrors.password ? "border-red-500" : ""}`}
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
              />
              {validationErrors.password && <p className="mt-1 text-sm text-red-600">{validationErrors.password}</p>}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </div>

          <div className="text-center">
            <span className="text-sm text-gray-600">
              Don't have an account?{" "}
              <Link href="/register" className="font-medium text-blue-600 hover:text-blue-500">
                Create one here
              </Link>
            </span>
          </div>
        </form>
      </div>
    </div>
  )
}
