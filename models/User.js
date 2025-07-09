import mongoose from "mongoose"

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [50, "Name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please enter a valid email"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
    },
    role: {
      type: String,
      enum: {
        values: ["manager", "employee"],
        message: "Role must be either manager or employee",
      },
      required: [true, "Role is required"],
    },
    department: {
      type: String,
      enum: {
        values: ["Engineering", "Consulting", "Finance", "Customer Support"],
        message: "Invalid department selected",
      },
      required: [true, "Department is required"],
    },
    employeeId: {
      type: String,
      unique: true,
    },
  },
  {
    timestamps: true,
  },
)

// Generate employee ID before saving
UserSchema.pre("save", async function (next) {
  if (this.isNew && !this.employeeId) {
    try {
      const count = await this.constructor.countDocuments()
      this.employeeId = `EMP${String(count + 1).padStart(4, "0")}`
      console.log(`Generated employeeId: ${this.employeeId}`)
    } catch (error) {
      console.error("Error generating employeeId:", error)
      return next(error)
    }
  }
  next()
})

// Ensure employeeId is always returned
UserSchema.methods.toJSON = function () {
  const user = this.toObject()
  delete user.password
  return user
}

export default mongoose.models.User || mongoose.model("User", UserSchema)
