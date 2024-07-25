import { User } from "../models/users.model.js";


const sendRequest = async (req, res) => {
    const { receiverId } = req.body;
    const senderId = req.user._id;

    if (!senderId || !receiverId) {
        return res.status(400).send({
            statusCode: 400,
            success: false,
            message: "Both Sender and Receiver Required",
        })
    }

    if (receiverId === senderId) {
        return res.status(400).send({
            statusCode: 400,
            success: false,
            message: "You cannot send a friend request to yourself."
        })
    }

    try {
        const receiver = await User.findById(receiverId);
        const sender = await User.findById(senderId);

        if (!receiver) {
            return res.status(404).send({
                statusCode: 404,
                success: false,
                message: "Recipient not found"
            })
        }

        if (receiver.friendRequestsReceived.includes(senderId) || receiver.friends.includes(senderId)) {
            return res.status(400).send({
                statusCode: 400,
                success: false,
                message: "Friend request already sent or you are already friends"
            })
        }

        receiver.friendRequestsReceived.push(senderId);
        sender.friendRequestsSent.push(receiverId);

        await receiver.save();
        await sender.save();

        return res.status(200).send({
            statusCode: 200,
            success: true,
            message: "Friend request sent successfully"
        })

    } catch (error) {
        console.log("Error : ", error)
        res.status(500).send({
            statusCode: 500,
            success: false,
            message: "Internal Server Error",
            error
        })
        res.status(500).json({ message: "An error occurred.", error });
    }
}


// Accept a friend request
const acceptRequest = async (req, res) => {
    const { senderId } = req.body;
    const receiverId = req.user._id;

    if (!senderId) {
        return res.status(400).send({
            statusCode: 400,
            success: false,
            message: "sender id required"
        })
    }

    try {
        const receiver = await User.findById(receiverId);
        const sender = await User.findById(senderId);


        if (!sender || !receiver) {
            return res.status(404).send({
                statusCode: 404,
                success: false,
                message: "User not found"
            })
        }

        receiver.friendRequestsReceived.pull(senderId);
        sender.friendRequestsSent.pull(receiverId);

        receiver.friends.push(senderId);
        sender.friends.push(receiverId);

        await receiver.save();
        await sender.save();

        return res.status(200).send({
            statusCode: 200,
            success: true,
            message: "Friend Request Accepted"
        })
    } catch (error) {
        console.log("Error : ", error)
        return res.status(500).send({
            statusCode: 500,
            success: false,
            message: "Internal Server Error"
        })
    }
}

// REJECT FRIEND REQUEST 
const rejectRequest = async (req, res) => {
    const { senderId } = req.body;
    const receiverId = req.user._id;

    if (!senderId) {
        return res.status(400).send({
            statusCode: 400,
            success: false,
            message: "Sender id required"
        })
    }

    try {
        const receiver = await User.findById(receiverId);
        const sender = await User.findById(senderId);

        if (!sender || !receiver) {
            return res.status(404).send({
                statusCode: 404,
                success: false,
                message: "User not found"
            })
        }

        receiver.friendRequestsReceived.pull(senderId);
        sender.friendRequestsSent.pull(receiverId);

        await receiver.save();
        await sender.save();


        res.status(200).send({
            statusCode : 200,
            success : true,
            message: "Friend request rejected."
        });
    } catch (error) {
        return res.status(500).send({
            statusCode : 500, 
            success : false,
            message : "Internal Server Error"
        })
    }
}



// Get friend requests
const getRequests = async (req, res) => {
    const userId = req.user._id;
  
    try {
      const user = await User.findById(userId).populate('friendRequestsReceived', 'username email fullName');
      res.status(200).send({ data : user.friendRequestsReceived});
    } catch (error) {
        console.log("ERROR : ", error)
        return res.status(500).send({
            message : "Internal Server Error"
        })
    }
  }


export { sendRequest, acceptRequest, rejectRequest, getRequests }