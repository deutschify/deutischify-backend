import mongoose from "mongoose";

const stateSchema = new mongoose.Schema({
    number: String,
    category: String,
    question: String,
    answerA: String,
    answerB: String,
    answerC: String,
    answerD: String,
    correctAnswer: String,
    explanation: String,
    imageURL: String,
    module: String,
    topic: String,
});



export const Deutschland = mongoose.model("deutschlandquestion", stateSchema);

