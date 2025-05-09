import express from "express"
import "dotenv/config"
import cors from "cors"
import job from "./lib/cron.js"
import authRoutes from "./routes/authRoutes.js"
import bookRoutes from "./routes/bookRoutes.js"

import { connectDB } from "./lib/db.js"

const app = express()
const PORT = process.env.PORT || 3000

job.start()
app.use(cors( {origin: "*", // for dev only; restrict in production
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"] }))
app.use(express.json())

app.use("/api/auth",authRoutes)
app.use("/api/books",bookRoutes)

app.listen(PORT,()=>{
  connectDB()
  console.log(`Server is running on the port http://localhost:${PORT}.`)
})