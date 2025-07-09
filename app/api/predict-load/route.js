import { NextResponse } from "next/server"
import { verifyToken, getTokenFromRequest } from "@/utils/auth"

export async function GET(request) {
  try {
    const token = getTokenFromRequest(request)
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded || decoded.role !== "manager") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Mock ML prediction - in real app, this would call an ML model
    const statuses = ["Normal", "Moderate", "Overloaded"]
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)]

    return NextResponse.json({
      status: randomStatus,
      department: decoded.department,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Predict load error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
