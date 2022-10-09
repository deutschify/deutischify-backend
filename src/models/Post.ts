import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    comment: { type: String, required: true },
});

const PostSchema = new mongoose.Schema(
    {
        desc: String,
        img: String,
        userId: { type: String, required: true },

        likes: { type: Array, default: [] },
        comments: { type: [commentSchema] },
    },
    { timestamps: true }
);

export const Post = mongoose.model("Post", PostSchema);
