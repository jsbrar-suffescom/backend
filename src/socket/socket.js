// socket.js
import mongoose from 'mongoose';
import { Server } from 'socket.io';
import { Message } from '../models/message.model.js';
import { User } from '../models/users.model.js';
import { ChatRoom } from '../models/chats.model.js';

export const setupSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true
    }
  });

  io.on('connection', (socket) => {
    console.log('New client connected');

    let userIdForStatus = "";

    socket.on('joinRoom', ({ roomId, userId }) => {
      userIdForStatus = userId;
      socket.join(roomId);
      console.log(`${userId} joined room ${roomId}`);
    });

    socket.on('sendMessage', async ({ roomId, userId, content, isImage, fullName }, callback) => {
      try {
        let newMessage;
        if (isImage) {
          newMessage = new Message({ sender: new mongoose.Types.ObjectId(userId), imageUrl: content, chatRoomId: new mongoose.Types.ObjectId(roomId), isImage });
        } else {
          newMessage = new Message({ sender: new mongoose.Types.ObjectId(userId), content: content.trim(), chatRoomId: new mongoose.Types.ObjectId(roomId), isImage });
        }
        
        await newMessage.save();

        await ChatRoom.findOneAndUpdate({ _id: roomId }, { latestMessage: newMessage._id }, { new: true });

        const messageWithFullName = {
          ...newMessage.toObject(),
          fullName
        };

        io.to(roomId).emit('receiveMessage', messageWithFullName);
        callback({ success: true });
      } catch (error) {
        console.log("ERROR", error);
        callback({ success: false });
      }
    });

    socket.on('updateStatus', async ({ userId, status }) => {
      try {
        const user = await User.findOneAndUpdate({ _id: userId }, { status }, { new: true });
        io.emit('statusUpdate', user);
      } catch (err) {
        console.error('Error updating user status:', err);
      }
    });

    socket.on('disconnect', async () => {
      console.log('Client disconnected', userIdForStatus);
      try {
        const user = await User.findOneAndUpdate({ socketId: socket.id }, { status: "offline" }, { new: true });
        if (user) {
          io.emit('statusUpdate', user);
        }
      } catch (err) {
        console.error('Error updating user status:', err);
      }
    });
  });

  return io;
};
