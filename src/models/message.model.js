import mongoose, { Schema } from "mongoose";

const messageSchema = new mongoose.Schema({
    chatRoomId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'ChatRoom',
        required : true
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required : true
    },
    content: {
        type: String,
    },
    isImage : {
        type : Boolean,
        default : false
    },
    imageUrl : {
        type : [String]
    }

}, {timestamps: true});

export const Message = mongoose.model('Message', messageSchema);
