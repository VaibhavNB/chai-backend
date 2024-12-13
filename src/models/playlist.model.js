import mongoose, { Schema } from "mongoose";


const playlistSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true
        },
        videos: [{
            type: Schema.Types.ObjectId, // one who is subscribing
            ref: "Video",
        }],
        owner: {
            type: Schema.Types.ObjectId, // one who is subscribing
            ref: "User",
            required: true
        }
    },
    {timestamps: true}  
)

export const Playlist = mongoose.model("Playlist", playlistSchema);