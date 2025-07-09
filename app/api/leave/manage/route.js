import { NextResponse } from "next/server"
import connectDB from "@/utils/db"
import LeaveRequest from "@/models/LeaveRequest"
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

    // Get all employees in the same department
    const departmentEmployees = await User.find({
      department: decoded.department,
      role: "employee",
    }).select("_id")

    const employeeIds = departmentEmployees.map((emp) => emp._id)

    // Get leave requests for department employees
    const leaveRequests = await LeaveRequest.find({
      employeeId: { $in: employeeIds },
    })
      .populate("employeeId", "name email employeeId department")
      .sort({ createdAt: -1 })

    return NextResponse.json({ leaveRequests })
  } catch (error) {
    console.error("Leave management error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(request) {
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

    const { requestId, status } = await request.json()

    if (!requestId || !status || !["approved", "rejected"].includes(status)) {
      return NextResponse.json({ error: "Invalid request data" }, { status: 400 })
    }

    const leaveRequest = await LeaveRequest.findById(requestId).populate("employeeId", "department")

    if (!leaveRequest) {
      return NextResponse.json({ error: "Leave request not found" }, { status: 404 })
    }

    // Check if the employee is in the same department
    if (leaveRequest.employeeId.department !== decoded.department) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    leaveRequest.status = status
    leaveRequest.reviewedBy = decoded.userId
    await leaveRequest.save()

    const updatedRequest = await LeaveRequest.findById(requestId)
      .populate("employeeId", "name email employeeId department")
      .populate("reviewedBy", "name email")

    return NextResponse.json({
      message: `Leave request ${status} successfully`,
      leaveRequest: updatedRequest,
    })
  } catch (error) {
    console.error("Leave management update error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
