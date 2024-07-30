// index.js
import dotenv from "dotenv";
import connectDB from "./db/index.js";
import { app } from './app.js';
import { createServer } from "http";
import { setupSocket } from "./socket/socket.js"; // Import the Socket.io setup

dotenv.config({ path: './.env' });

const server = createServer(app);

setupSocket(server); // Set up Socket.io

connectDB()
  .then(() => {
    server.listen(process.env.PORT || 8000, () => {
      console.log(`⚙️ Server is running at port: ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.log("MONGO db connection failed !!!", err);
  });
