
import { nanoid } from "nanoid";
import { ChatRoom } from "../models/chats.model.js";
import { Message } from "../models/message.model.js";
import { ApiError } from "../utils/ApiError.js";


import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose from "mongoose";

// Create a new chat room
const createChatRoom = async (req, res) => {

    const { userId, receiverId } = req.body;

    console.log("IDS : ", userId , receiverId)

    try {
        if (!userId || !receiverId) {
            return res.status(400).send({
                message: "name and members both required",
                success: false
            })
        }

        const check = await ChatRoom.findOne({
            isGroup: false,
            members: { $all: [userId, receiverId] }
        });

        if (check) {
            return res.status(200).send({
                data : check,
                message: "room already created",
                success: true
            })
        }


        const name = nanoid();

        const chatRoom = new ChatRoom({ name, members: [userId, receiverId] });
        await chatRoom.save();

        if (chatRoom) {
            return res.status(201).send({
                data: chatRoom,
                message: "successfully created chat room",
                success: true
            })

        }
        else {
            return res.status(400).send({
                message: "failed to create chat room",
                success: true
            })
        }
    } catch (error) {
        console.log(error)
        return res.status(500).send({
            message: "internal server error",
            success: false
        })
    }
}



// Get all chat rooms
const getChatRoom = async (req, res) => {
    const {userId} =  req.params
   
    const chatRooms = await ChatRoom.find({ members: { $in: [userId] } });
    try {
        if (chatRooms.length > 0) {
            return res.status(200).send({
                data: chatRooms,
                message: "Chat Rooms Found",
                success: true
            })
        }
        else {
            return res.status(404).send({
                message: "Chat Rooms Not Found",
                success: false
            })
        }
    } catch (error) {
        console.log("ERROR WHILE FETCHING CHAT ROOMS : ", error)
        return res.send(500).send({
            message: "Internal Server Error",
            success: false
        })
    }
}



// Get messages in a chat room
const getChatRoomMessages = async (req, res) => {
    const { chatRoomId } = req.params;


   
    const messages = await Message.find({ chatRoomId : new mongoose.Types.ObjectId(chatRoomId) }).populate('sender').sort('timestamp');

    if (messages.length > 0) {
        return res.status(200).send({
            data: messages,
            message: "Messages Found",
            success: true
        })
    }
    else {
        return res.status(200).send({
            data : [],
            message: "messages not found",
            success: false
        })
    }
}

// SEND IMAGE 

// handle image upload and response
const sendImage = async (req, res) => {
    const files = req.files;
    if (!files || files.length === 0) {
        return res.status(400).send({ message: 'No file uploaded' });
    }

    try {
        const urls = files.map(file => `http://localhost:8000/temp/${file.filename}`);
        res.status(200).json({ urls });
    } catch (error) {
        console.error("Error sending image:", error);
        res.status(500).send('Server error');
    }
}


export { createChatRoom, getChatRoom, getChatRoomMessages, sendImage }
