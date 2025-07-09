import { NextResponse } from "next/server"
import connectDB from "@/utils/db"
import Task from "@/models/Task"
import { verifyToken, getTokenFromRequest } from "@/utils/auth"

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

    let tasks

    if (decoded.role === "manager") {
      // Managers see all tasks in their department
      tasks = await Task.find({ department: decoded.department })
        .populate("assignedTo", "name email employeeId")
        .sort({ createdAt: -1 })
    } else {
      // Employees see only their assigned tasks
      tasks = await Task.find({ assignedTo: decoded.userId })
        .populate("assignedBy", "name email")
        .sort({ createdAt: -1 })
    }

    return NextResponse.json({ tasks })
  } catch (error) {
    console.error("Task list error:", error)
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
    if (!decoded) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { taskId, status } = await request.json()

    if (!taskId || !status) {
      return NextResponse.json({ error: "Task ID and status are required" }, { status: 400 })
    }

    // Find the task
    const task = await Task.findById(taskId)
    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 })
    }

    // Check if user can update this task
    if (decoded.role === "employee" && task.assignedTo.toString() !== decoded.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Update task status
    task.status = status
    await task.save()

    const updatedTask = await Task.findById(taskId).populate("assignedTo", "name email employeeId")

    return NextResponse.json({
      message: "Task updated successfully",
      task: updatedTask,
    })
  } catch (error) {
    console.error("Task update error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
