// import { IUser } from "../src/interfaces.js";
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    rating: Number,
    email: String,
    password: String,
    feedback: String,
    languages: String,
    nationality: String,
    accessGroups: [String]
})

 
export const User = mongoose.model('user', userSchema);


