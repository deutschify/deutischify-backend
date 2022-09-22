import mongoose from "mongoose";

const PostSchema = new mongoose.Schema(
    {
        desc: String,
        img: String,
        likes: { type: Array, default: [] },
    },
    { timestamps: true }
);

export const Post = mongoose.model("Post", PostSchema);
