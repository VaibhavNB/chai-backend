import mongoose, { Schema } from "mongoose";

const likeSchema = new Schema(
    {
        video: {
            type: Schema.Types.ObjectId, // one who is subscribing
            ref: "Video",
            required: true
        },
        owner: {
            type: Schema.Types.ObjectId, // one who is subscribing
            ref: "User",
            required: true
        },
        tweet:{
            type: Schema.Types.ObjectId, // one who is subscribing
            ref: "Tweet",
            required: true
        },
        likedBy:{
            type: Schema.Types.ObjectId, // one who is subscribing
            ref: "User",
            required: true
        }
    },
    {timestamps: true}  
)

export const Like = mongoose.model("Like", likeSchema);

