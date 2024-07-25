import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.js";
import { acceptRequest, getRequests, rejectRequest, sendRequest } from "../controllers/friendRequest.controller.js";


var router = Router()

router.route("/sendRequest").post(verifyJWT,sendRequest)
router.route("/acceptRequest").post(verifyJWT, acceptRequest)
router.route("/rejectRequest").post(verifyJWT, rejectRequest)
router.route("/getRequests").get(verifyJWT, getRequests)






export default router
