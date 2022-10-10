// import { IUser } from "../src/interfaces.js";
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        firstName: String,
        lastName: String,
        rating: Number,
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true, unique: true },
        isAdmin: { type: Boolean, required: false },
        feedback: String,
        language: String,
        nationality: String,
        confirmationCode: String,
        accessGroups: [String],
        imagePublicId: String,
        answeredQuestions: [String],
    },
    // timestamps tell us when was the user created or updated
    { timestamps: true }
);

export const User = mongoose.model("user", userSchema);
