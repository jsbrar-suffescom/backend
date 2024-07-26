import dotenv from "dotenv";
import connectDB from "./db/index.js";
import { app } from './app.js';
import { createServer } from "http";
import { Server } from "socket.io";
import { Message } from "./models/message.model.js";
import mongoose, { mongo } from "mongoose";
import { User } from "./models/users.model.js";
import { upload } from "./middlewares/multer.js";
import { ChatRoom } from "./models/chats.model.js";

dotenv.config({ path: './.env' });

const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true
  }
});

connectDB()
  .then(() => {
    server.listen(process.env.PORT || 8000, () => {
      console.log(`⚙️ Server is running at port: ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.log("MONGO db connection failed !!!", err);
  });

// Socket.io setup
io.on('connection', (socket) => {
  console.log('New client connected');

  var userIdForStatus = ""

  socket.on('joinRoom', ({ roomId, userId }) => {

    userIdForStatus = userId
    socket.join(roomId);
    console.log(`${userId} joined room ${roomId}`);
  });

  socket.on('sendMessage', async ({ roomId, userId, content, isImage, fullName }) => {

    console.log("CONTENT ::>>>> ", fullName)
    if (isImage) {
      try {
        const newMessage = new Message({ sender: new mongoose.Types.ObjectId(userId), imageUrl: content, chatRoomId: new mongoose.Types.ObjectId(roomId), isImage });
      await newMessage.save();

      const data = await Message.findOneAndUpdate({ _id: roomId }, { latestMessage: newMessage._id }, { new: true })
      console.log("DATA", data)
      const messageWithFullName = {
        ...newMessage.toObject(),
        fullName
      };

      io.to(roomId).emit('receiveMessage', messageWithFullName);
      } catch (error) {
        console.log("Error : ", error)
      }
    }
    else {
      const newMessage = new Message({ sender: new mongoose.Types.ObjectId(userId), content: content.trim(), chatRoomId: new mongoose.Types.ObjectId(roomId), isImage });
      await newMessage.save();



      const data = await ChatRoom.findOneAndUpdate({ _id: roomId }, { latestMessage: newMessage._id }, { new: true })
      console.log("DATA", data)
      const messageWithFullName = {
        ...newMessage.toObject(),
        fullName
      };
      io.to(roomId).emit('receiveMessage', messageWithFullName);
    }


  });

  socket.on('updateStatus', async ({ userId, status }) => {

    try {

      const user = await User.findOneAndUpdate({ _id: userId }, { status }, { new: true })
      io.emit('statusUpdate', user); // Broadcast updated user status to all clients
    } catch (err) {
      console.error('Error updating user status:', err);
    }

  })

  socket.on('disconnect', async () => {
    console.log('Client disconnected', userIdForStatus);

    try {
      const user = await User.findOneAndUpdate({ socketId: socket.id }, { status: "offline" }, { new: true });
      if (user) {
        io.emit('statusUpdate', user); // Broadcast updated user status to all clients
      }
    } catch (err) {
      console.error('Error updating user status:', err);
    }
  });
});

;
