import jwt from "jsonwebtoken"
import User from "../models/User.js"

const protectRoute = async (req, res, next) => {
  try {
    const authHeader = req.header("Authorization")

    // Check for Bearer token
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No Token Provided! Unauthorized" })
    }

    const token = authHeader.replace("Bearer ", "").trim()

    if (!token) {
      return res.status(401).json({ message: "No Bearer Token Provided! Unauthorized" })
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // Find user
    const user = await User.findById(decoded.userId).select("-password")

    if (!user) {
      return res.status(401).json({ message: "Invalid Token" })
    }

    // Attach user to request object
    req.user = user
    next()

  } catch (error) {
    console.error("Error in middleware:", error.message)
    return res.status(500).json({ message: "Internal Server Error!" })
  }
}

export default protectRoute
