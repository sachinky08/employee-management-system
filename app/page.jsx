"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Cookies from "js-cookie"

// Client-side token verification function
function verifyTokenClient(token) {
  try {
    if (!token) return null

    const base64Url = token.split(".")[1]
    if (!base64Url) return null

    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/")
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join(""),
    )

    const decoded = JSON.parse(jsonPayload)

    if (decoded.exp && decoded.exp < Date.now() / 1000) {
      return null
    }

    return decoded
  } catch (error) {
    return null
  }
}

export default function Home() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = Cookies.get("token")

    if (!token) {
      router.push("/login")
      setLoading(false)
      return
    }

    const decoded = verifyTokenClient(token)

    if (!decoded) {
      Cookies.remove("token")
      router.push("/login")
      setLoading(false)
      return
    }

    // Redirect based on role
    if (decoded.role === "manager") {
      router.push("/manager-dashboard")
    } else {
      router.push("/employee-dashboard")
    }

    setLoading(false)
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return null
}
