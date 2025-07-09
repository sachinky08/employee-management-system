import { NextResponse } from "next/server"
import connectDB from "@/utils/db"
import User from "@/models/User"

export async function GET() {
  try {
    console.log("🧪 Testing database connection...")
    await connectDB()

    const userCount = await User.countDocuments()
    const users = await User.find({}).select("name email role department employeeId createdAt").limit(5)

    console.log("✅ Database test successful")

    return NextResponse.json({
      message: "Database connection successful",
      userCount,
      sampleUsers: users,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("❌ Database test error:", error)
    return NextResponse.json(
      {
        error: "Database connection failed",
        details: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}

export async function POST() {
  try {
    console.log("🧪 Creating test user...")
    await connectDB()

    const testUser = {
      name: "Test Manager",
      email: `test-${Date.now()}@example.com`,
      password: "password123",
      role: "manager",
      department: "Engineering",
    }

    const bcrypt = require("bcryptjs")
    testUser.password = await bcrypt.hash(testUser.password, 12)

    const user = await User.create(testUser)
    console.log("✅ Test user created:", user.employeeId)

    return NextResponse.json({
      message: "Test user created successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        employeeId: user.employeeId,
      },
    })
  } catch (error) {
    console.error("❌ Test user creation error:", error)
    return NextResponse.json(
      {
        error: "Failed to create test user",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
