import { NextResponse } from "next/server"
import connectDB from "@/utils/db"
import LeaveRequest from "@/models/LeaveRequest"
import { verifyToken, getTokenFromRequest } from "@/utils/auth"

export async function POST(request) {
  try {
    await connectDB()

    const token = getTokenFromRequest(request)
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { reason, startDate, endDate } = await request.json()

    if (!reason || !startDate || !endDate) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    const leaveRequest = await LeaveRequest.create({
      employeeId: decoded.userId,
      reason,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
    })

    const populatedRequest = await LeaveRequest.findById(leaveRequest._id).populate(
      "employeeId",
      "name email employeeId",
    )

    return NextResponse.json(
      {
        message: "Leave request submitted successfully",
        leaveRequest: populatedRequest,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Leave request error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request) {
  try {
    await connectDB()

    const token = getTokenFromRequest(request)
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    let leaveRequests

    if (decoded.role === "employee") {
      // Employees see only their leave requests
      leaveRequests = await LeaveRequest.find({ employeeId: decoded.userId }).sort({ createdAt: -1 })
    } else {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    return NextResponse.json({ leaveRequests })
  } catch (error) {
    console.error("Leave request list error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
