// import { IUser } from "../src/interfaces.js";
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    rating: Number,
    email: String,
    password: String,
    feedback: String,
    language: String,
    nationality: String,
    confirmationCode: String,
    accessGroups: [String],
    imagePublicId: String,
})

 
export const User = mongoose.model('user', userSchema);


