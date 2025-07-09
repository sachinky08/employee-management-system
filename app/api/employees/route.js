import { NextResponse } from "next/server"
import connectDB from "@/utils/db"
import User from "@/models/User"
import { verifyToken, getTokenFromRequest } from "@/utils/auth"

export async function GET(request) {
  try {
    await connectDB()

    const token = getTokenFromRequest(request)
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded || decoded.role !== "manager") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get all employees in the same department (excluding managers)
    const employees = await User.find({
      department: decoded.department,
      role: "employee",
    })
      .select("-password")
      .sort({ name: 1 })

    return NextResponse.json({ employees })
  } catch (error) {
    console.error("Employees list error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
