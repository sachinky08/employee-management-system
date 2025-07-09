"use client"

import { useRouter } from "next/navigation"
import Cookies from "js-cookie"

export default function Header({ user }) {
  const router = useRouter()

  const handleLogout = () => {
    Cookies.remove("token")
    router.push("/login")
  }

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-semibold text-gray-900">Employee Management System</h1>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-600">
              Welcome, <span className="font-medium">{user?.name}</span>
            </div>
            <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
              {user?.role} • {user?.department}
            </div>
            <button onClick={handleLogout} className="text-sm text-red-600 hover:text-red-800 font-medium">
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
