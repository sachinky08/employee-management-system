import { NextResponse } from "next/server"
import connectDB from "@/utils/db"
import Task from "@/models/Task"
import User from "@/models/User"
import { verifyToken, getTokenFromRequest } from "@/utils/auth"

export async function POST(request) {
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

    const { title, description, assignedTo } = await request.json()

    if (!title || !description || !assignedTo) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    // Verify the assigned user exists and is in the same department
    const assignedUser = await User.findById(assignedTo)
    if (!assignedUser || assignedUser.department !== decoded.department) {
      return NextResponse.json({ error: "Invalid employee selection" }, { status: 400 })
    }

    const task = await Task.create({
      title,
      description,
      assignedTo,
      department: decoded.department,
      assignedBy: decoded.userId,
    })

    const populatedTask = await Task.findById(task._id).populate("assignedTo", "name email employeeId")

    return NextResponse.json(
      {
        message: "Task assigned successfully",
        task: populatedTask,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Task assignment error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
