// import { create, getMessages, messages } from "../controllers/users.controller.js";
import { Router } from "express";
import { getAllUsers, loginUser, registerUser, setSocketId } from "../controllers/users.controller.js";
import { verifyJWT } from "../middlewares/auth.js";


const router = Router()

// USER ROUTES
router.route("/registerUser").post(registerUser)
router.route("/login").post(loginUser)
router.route("/getAllUsers").get(verifyJWT, getAllUsers)
router.route("updateStatus").put()

// USER SOCKET ID ROUTES
router.route("/setSocketId").post(verifyJWT, setSocketId)
// router.route("/getSocketId/:receiverId").get(verifyJWT, getSocketId)



export default router