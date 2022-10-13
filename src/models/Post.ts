import mongoose from "mongoose";

const CommentSchema = new mongoose.Schema(
    {
        userId: { type: String, required: true },
        comment: { type: String, required: true },
    },
    { timestamps: true }
);

const PostSchema = new mongoose.Schema(
    {
        desc: String,
        img: String,
        userId: { type: String, required: true },

        likes: { type: Array, default: [] },
        comments: { type: [CommentSchema] },
    },
    { timestamps: true }
);

export const Post = mongoose.model("Post", PostSchema);
export const Comment = mongoose.model("Comment", CommentSchema);
