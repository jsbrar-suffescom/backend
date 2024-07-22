import { verifyJWT } from "../middlewares/auth.js";
import { Router } from "express";
import { upload } from "../middlewares/multer.js";
import { createChatRoom, getChatRoom, getChatRoomMessages, sendImage } from "../controllers/chatRoom.models.js";


const router = Router()

// MESSAGES ROUTES
// router.route("/getAllMessages/:userId/:receiverId").get(verifyJWT, getAllMessages)

// router.route("/getUserByLastMessage/:stringId").get(getUserByLastMessage)

// CREATE CHAT ROOM
router.route("/createChatRoom").post(verifyJWT, createChatRoom)
// GET CHAT ROOMS BY USER
router.route("/getChatRooms/:userId").get(verifyJWT, getChatRoom)
// GET MESSAGES BY CHAT ROOM
router.route("/getChatRoomMessages/:chatRoomId").get(verifyJWT, getChatRoomMessages)

// UPLOAD FILE
router.route("/uploadImages").post(verifyJWT, upload.array("file", 12), sendImage)







export default router