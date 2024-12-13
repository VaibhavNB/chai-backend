import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const tweetSchema = new Schema(
    {
        content: {
            type: String,
            required: true,
        },
        owner: {
            type: Schema.Types.ObjectId, // one who is subscribing
            ref: "User",
            required: true
        }

    },
    {timestamps: true}
)


export const Tweet = mongoose.model("Tweet", tweetSchema);
