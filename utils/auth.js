import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is required")
}

export function generateToken(payload) {
  try {
    console.log("🎫 Generating JWT token for:", payload.email)

    // Ensure all required fields are present
    const tokenData = {
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
      department: payload.department,
      employeeId: payload.employeeId,
      name: payload.name,
      iat: Math.floor(Date.now() / 1000),
    }

    const token = jwt.sign(tokenData, JWT_SECRET, { expiresIn: "7d" })
    console.log("✅ Token generated successfully")
    return token
  } catch (error) {
    console.error("❌ Token generation error:", error)
    throw new Error("Failed to generate authentication token")
  }
}

export function verifyToken(token) {
  try {
    if (!token) {
      console.log("⚠️ No token provided")
      return null
    }

    const decoded = jwt.verify(token, JWT_SECRET)
    console.log("✅ Token verified for user:", decoded.email)

    // Ensure all required fields are present
    if (!decoded.userId || !decoded.email || !decoded.role || !decoded.department) {
      console.log("❌ Token missing required fields")
      return null
    }

    return decoded
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      console.log("⚠️ Token expired")
    } else if (error.name === "JsonWebTokenError") {
      console.log("❌ Invalid token")
    } else {
      console.error("❌ Token verification error:", error)
    }
    return null
  }
}

export function getTokenFromRequest(request) {
  try {
    const authHeader = request.headers.get("authorization")
    if (authHeader && authHeader.startsWith("Bearer ")) {
      return authHeader.substring(7)
    }

    // Also check cookies as fallback
    const cookieHeader = request.headers.get("cookie")
    if (cookieHeader) {
      const tokenMatch = cookieHeader.match(/token=([^;]+)/)
      if (tokenMatch) {
        return tokenMatch[1]
      }
    }

    return null
  } catch (error) {
    console.error("❌ Token extraction error:", error)
    return null
  }
}
