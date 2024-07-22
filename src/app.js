import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import path from 'path'

const app = express()


app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({extended: true, limit: "16kb"}))
app.use(express.static("public"))
app.use(cookieParser())





//routes import
import userRouter from './routes/users.route.js'
import chatRoomRouter from './routes/chatRoom.route.js'



//routes declaration

app.use("/api/v1/users", userRouter)
app.use("/api/v1/chatRoom", chatRoomRouter)




export { app }