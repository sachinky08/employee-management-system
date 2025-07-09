"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "employee",
    department: "Engineering",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [validationErrors, setValidationErrors] = useState({})
  const router = useRouter()

  const validateForm = () => {
    const errors = {}

    if (!formData.name || formData.name.trim().length < 2) {
      errors.name = "Name must be at least 2 characters"
    }

    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Please enter a valid email address"
    }

    if (!formData.password || formData.password.length < 6) {
      errors.password = "Password must be at least 6 characters"
    }

    if (!formData.role) {
      errors.role = "Please select a role"
    }

    if (!formData.department) {
      errors.department = "Please select a department"
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
    console.log("🚀 Registration form submitted")

    if (!validateForm()) {
      console.log("❌ Form validation failed")
      return
    }

    setLoading(true)
    setError("")

    try {
      console.log("📤 Sending registration request...")
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()
      console.log("📥 Registration response:", {
        ...data,
        user: data.user ? { ...data.user, password: "[HIDDEN]" } : undefined,
      })

      if (response.ok) {
        console.log("✅ Registration successful")
        router.push("/login?message=Registration successful! Please login with your credentials.")
      } else {
        console.log("❌ Registration failed:", data.error)
        setError(data.error || "Registration failed")
      }
    } catch (error) {
      console.error("❌ Registration network error:", error)
      setError("Network error. Please check your connection and try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Create your account</h2>
          <p className="mt-2 text-center text-sm text-gray-600">Join our employee management system</p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">{error}</div>}

          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Full Name *
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className={`input-field ${validationErrors.name ? "border-red-500" : ""}`}
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleChange}
              />
              {validationErrors.name && <p className="mt-1 text-sm text-red-600">{validationErrors.name}</p>}
            </div>

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
                placeholder="Enter your password (min 6 characters)"
                value={formData.password}
                onChange={handleChange}
              />
              {validationErrors.password && <p className="mt-1 text-sm text-red-600">{validationErrors.password}</p>}
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                Role *
              </label>
              <select
                id="role"
                name="role"
                className={`input-field ${validationErrors.role ? "border-red-500" : ""}`}
                value={formData.role}
                onChange={handleChange}
              >
                <option value="employee">Employee</option>
                <option value="manager">Manager</option>
              </select>
              {validationErrors.role && <p className="mt-1 text-sm text-red-600">{validationErrors.role}</p>}
            </div>

            <div>
              <label htmlFor="department" className="block text-sm font-medium text-gray-700">
                Department *
              </label>
              <select
                id="department"
                name="department"
                className={`input-field ${validationErrors.department ? "border-red-500" : ""}`}
                value={formData.department}
                onChange={handleChange}
              >
                <option value="Engineering">Engineering</option>
                <option value="Consulting">Consulting</option>
                <option value="Finance">Finance</option>
                <option value="Customer Support">Customer Support</option>
              </select>
              {validationErrors.department && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.department}</p>
              )}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </div>

          <div className="text-center">
            <span className="text-sm text-gray-600">
              Already have an account?{" "}
              <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
                Sign in here
              </Link>
            </span>
          </div>
        </form>
      </div>
    </div>
  )
}
