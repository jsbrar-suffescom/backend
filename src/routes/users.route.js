// import { create, getMessages, messages } from "../controllers/users.controller.js";
import { Router } from "express";
import { getUserDetails, getUsersBySearch, loginUser, registerUser, setSocketId } from "../controllers/users.controller.js";
import { verifyJWT } from "../middlewares/auth.js";


const router = Router()

// USER ROUTES
router.route("/registerUser").post(registerUser)
router.route("/login").post(loginUser)
router.route("/getUserDetails").get(verifyJWT, getUserDetails)
router.route("/getUsersBySearch").get(verifyJWT, getUsersBySearch)

// USER SOCKET ID ROUTES
router.route("/setSocketId").post(verifyJWT, setSocketId)




export default router