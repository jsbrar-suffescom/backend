import mongoose, { Schema } from "mongoose";


const chatRoomSchema = new Schema({
    name: {
        type: String,
    },
    isGroup: {
        type: Boolean,
        default: false
    },
    members: [{
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }],
}, { timestamps: true });

export const ChatRoom = mongoose.model('ChatRoom', chatRoomSchema);


