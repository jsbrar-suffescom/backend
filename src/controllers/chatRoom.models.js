
import { nanoid } from "nanoid";
import { ChatRoom } from "../models/chats.model.js";
import { Message } from "../models/message.model.js";
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

        const chatRoom = new ChatRoom({ name, members: [userId, receiverId], createdBy : userId });
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


const createGroupChatRoom = async (req, res) => {

    const {userId, membersIds, groupName } = req.body;
        
    console.log("USER ID ", userId, "Mids", membersIds, "groupName", groupName)

    try {
        if (!userId || !membersIds || !groupName) {
            return res.status(400).send({
                message: "Group Name, Memebrs, and User all are required",
                success: false
            })
        }

    
        const name = nanoid();
        const members = membersIds
        members.push(userId)

        const chatRoom = new ChatRoom({ name, members, isGroup : true,  createdBy : userId, groupName });
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
    const { userId } = req.params;
    const userObjectId = new mongoose.Types.ObjectId(userId);

    try {
        const chatRooms = await ChatRoom.aggregate([
            { $match: { members: { $in: [userObjectId] } } },
            {
                $addFields: {
                    otherMembers: {
                        $filter: {
                            input: '$members',
                            as: 'member',
                            cond: { $ne: ['$$member', userObjectId] }
                        }
                    }
                }
            },
            {
                $lookup: {
                    from: 'users', // name of the User collection
                    localField: 'otherMembers',
                    foreignField: '_id',
                    as: 'otherMemberDetails'
                }
            },
            {
                $lookup: {
                    from: 'messages',
                    localField: '_id', // Assuming chat rooms have _id that matches messages' chatRoomId
                    foreignField: 'chatRoomId', // The field in messages that refers to chatRoom
                    as: 'messageDetails'
                }
            },
            {
                $addFields: {
                    messageCount: { $size: '$messageDetails' } // Count the number of messages
                }
            },
            {
                $lookup: {
                    from: 'messages',
                    localField: 'latestMessage',
                    foreignField: '_id',
                    as: 'latestMessageDetail'
                }
            },
            {
                $unwind: {
                    path: "$latestMessageDetail",
                    preserveNullAndEmptyArrays: true // To handle chat rooms without a latest message
                }
            },
            { $sort: { updatedAt: -1 } },
            {
                $project: {
                    isGroup: 1,
                    members: 1,
                    otherMemberDetails: 1,
                    groupName: 1,
                    name: 1, 
                    latestMessage: 1,
                    updatedAt: 1,
                    latestMessageDetail: 1,
                    messageCount: 1 // Include the message count in the result
                }
            }
        ]);

        if (chatRooms.length > 0) {
            return res.status(200).send({
                data: chatRooms,
                message: "Chat Rooms Found",
                success: true
            });
        } else {
            return res.status(404).send({
                message: "Chat Rooms Not Found",
                success: false
            });
        }
    } catch (error) {
        console.log("ERROR WHILE FETCHING CHAT ROOMS : ", error);
        return res.status(500).send({
            message: "Internal Server Error",
            success: false
        });
    }
}





// Get messages in a chat room
const getChatRoomMessages = async (req, res) => {
    const { chatRoomId } = req.params;


   
    const messages = await Message.aggregate([
        {
          $match: { chatRoomId: new mongoose.Types.ObjectId(chatRoomId) }
        },
        {
          $lookup: {
            from: 'users', // The collection to join with
            localField: 'sender', // The field from the messages collection
            foreignField: '_id', // The field from the users collection
            as: 'senderDetails' // The name of the array to store the joined documents
          }
        },
        {
          $unwind: '$senderDetails' // Deconstruct the array created by $lookup
        },
        {
          $sort: { timestamp: 1 } // Sort by timestamp in ascending order
        }
      ]);
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


export { createChatRoom, getChatRoom, getChatRoomMessages, sendImage, createGroupChatRoom }
