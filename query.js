const User = require('./models/user');
const Message = require('./models/message');

async function getUsersByLastMessage(req, res) {
  try {
    // Fetch the last message for each user
    const messages = await Message.aggregate([
      {
        $sort: { timestamp: -1 } // Sort messages by timestamp in descending order
      },
      {
        $group: {
          _id: '$sender',
          lastMessage: { $first: '$$ROOT' } // Group by sender and get the first message (latest)
        }
      },
      {
        $lookup: {
          from: 'users', // Reference to the 'users' collection
          localField: 'userId',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $unwind: '$user' // Deconstruct the 'user' array
      },
      {
        $project: {
          _id: 0,
          user: 1,
          lastMessage: 1
        }
      },
      {
        $sort: { 'lastMessage.timestamp': -1 } // Sort users by the timestamp of their last message
      }
    ]);

    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

