import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import connectDB from "@/utils/db"
import User from "@/models/User"
import { generateToken } from "@/utils/auth"

export async function POST(request) {
  try {
    console.log("=== LOGIN START ===")
    await connectDB()

    const body = await request.json()
    console.log("Login request for email:", body.email)

    const { email, password } = body

    // Validate required fields
    if (!email || !password) {
      console.log("❌ Missing credentials")
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    // Find user and include all necessary fields
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select("+password")
    if (!user) {
      console.log("❌ User not found:", email)
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    console.log("👤 User found:", {
      id: user._id,
      email: user.email,
      employeeId: user.employeeId,
      role: user.role,
      department: user.department,
    })

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      console.log("❌ Invalid password for:", email)
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Ensure employeeId exists (fallback generation if missing)
    if (!user.employeeId) {
      console.log("⚠️ Missing employeeId, generating...")
      const count = await User.countDocuments()
      user.employeeId = `EMP${String(count).padStart(4, "0")}`
      await user.save()
    }

    // Generate token with all necessary fields
    const tokenPayload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      department: user.department,
      employeeId: user.employeeId,
      name: user.name,
    }

    console.log("🎫 Generating token with payload:", tokenPayload)
    const token = generateToken(tokenPayload)

    // Prepare user response
    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      employeeId: user.employeeId,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }

    console.log("✅ Login successful for:", email)
    console.log("=== LOGIN SUCCESS ===")

    return NextResponse.json({
      message: "Login successful",
      token,
      user: userResponse,
    })
  } catch (error) {
    console.error("❌ Login error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
