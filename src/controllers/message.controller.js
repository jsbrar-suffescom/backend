// import mongoose from "mongoose";
// import { Message } from "../models/message.model.js";
// import { ApiResponse } from "../utils/ApiResponse.js";
// import { User } from "../models/users.model.js";

// // FOR FETCHING ALL THE MESSAGES

// const getAllMessages = async (req, res) => {
//     try {
//         const { userId, receiverId } = req.params;

//         const messages = await Message.find({
//             $or: [
//                 { sender: userId, receiver: receiverId },
//                 { sender: receiverId, receiver: userId }
//             ]
//         }).sort({ createdAt: 'asc' });

//         res.status(200).json({ success: true, data: messages });
//     } catch (error) {
//         console.error('Error fetching messages:', error);
//         res.status(500).json({ success: false, error: 'Error fetching messages' });
//     }
// };

// // FOR SNEDING IMAGE 

// const sendImage = async (req, res) => {
//     const file = req.file;
//     if (!file) {
//         return res.status(400).send({ message: 'No file uploaded' });
//     }
//     res.send({ url: `http://localhost:8000/temp/${file.filename}` });
// }


// // FOR GET THE USER BY LAST MESSAGE 

// const getUserByLastMessage = async (req, res) => {
//     const { stringId } = req.params;
//     console.log("GET USERS BY LAST MNSGED CLICKED");
//     const userId = new mongoose.Types.ObjectId(stringId);
//     console.log("UserID", userId);

//     try {
//         // Fetch the last message for each user
//         const messages = await Message.aggregate([
//             {
//                 $match: {
//                     $or: [
//                         { sender: userId },
//                         { receiver: userId }
//                     ]
//                 }
//             },
//             { $sort: { _id: -1 } },
//             { 
//                 $group: {
//                     _id: {
//                         $cond: [
//                             { $eq: ['$sender', userId] },
//                             '$receiver',
//                             '$sender'
//                         ]
//                     },
//                     lastMessage: { $first: '$$ROOT' }
//                 }
//             },
//             { 
//                 $lookup: {
//                     from: "users",
//                     localField: "_id",
//                     foreignField: "_id",
//                     as: "userDetails"
//                 }
//             },
//             { $unwind: { path: '$userDetails', preserveNullAndEmptyArrays: true } },
//             { 
//                 $project: {
//                     _id: 0,
//                     lastMessage : 1,
//                     userDetails: 1,
//                 }
//             },
//             { $sort: { 'lastMessage._id': -1 } }
//         ]);

//         // Filter out the user with the received userId from the messages list
//         const filteredMessages = messages.filter(message => !message.userDetails._id.equals(userId));

//         // Extract IDs of users you have already communicated with, excluding the current userId
//         const messagedUserIds = filteredMessages.map(message => message.userDetails._id);

//         // Fetch all users except the ones already communicated with and the current userId
//         const otherUsers = await User.find({
//             _id: { $nin: [...messagedUserIds, userId] }
//         }).sort({ username: 1 }).lean();

//         // Append the other users to the filtered messages array with empty lastMessage
//         const result = [
//             ...filteredMessages,
//             ...otherUsers.map(user => ({
//                 lastMessage: [],
//                 userDetails: user
//             }))
//         ];

//         res.status(200).send({
//             data: result
//         });
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// };



// export { getAllMessages, sendImage, getUserByLastMessage }