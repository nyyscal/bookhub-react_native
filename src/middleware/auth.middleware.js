import jwt from "jsonwebtoken"
import User from "../models/User.js"


const protectRoute = async(req,res,next)=>{
try {
  const token = req.header("Authorization").replace("Bearer ","")
  if(!token) return res.status(401).json({message:"No Token Provided! Unauthorized"})

    //verify token
    const decoded = jwt.verify(token,process.env.JET_SECRET)

    //find the user
    const user = await User.findById(decoded.userId).select("-password")

    if(!user) return res.status(401).json({message:"Invalid Token"})

    req.user = user
} catch (error) {
  console.log("Error in middleware",error)
  return res.json(500).json({message:"Internal Server Error!"})
}
}

export default protectRoute