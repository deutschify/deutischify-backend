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
    imageUrl: String
});

export const Berlin = mongoose.model("berlin-question", stateSchema);
export const Hessen = mongoose.model("hessen-question", stateSchema);
export const Sachsen = mongoose.model("sachsen-question", stateSchema);
export const SachsenAnhalt = mongoose.model("sachsen-anhalt-question", stateSchema);
export const SchleswigHolstein = mongoose.model("schleswig-holstein-question", stateSchema);
export const Thueringen = mongoose.model("thueringen-question", stateSchema);
export const Saarland = mongoose.model("saarland-question", stateSchema);
export const Niedersachsen = mongoose.model("niedersachsen-question", stateSchema);
export const MecklenburgVorpommern = mongoose.model("mecklenburg-vorpommern-question", stateSchema);
export const Bayern = mongoose.model("bayern-question", stateSchema);
export const Brandenburg = mongoose.model("brandenburg-question", stateSchema);
export const Bremen = mongoose.model("bremen-question", stateSchema);
export const Hamburg = mongoose.model("hamburg-question", stateSchema);
export const NordrheinWestfalen = mongoose.model("nordrhein-westfalen-question", stateSchema);
export const RheinlandPfalz = mongoose.model("rheinlandPfalz-question", stateSchema);
export const BadenWuerttemberg = mongoose.model("badenwuerttemberg-question", stateSchema);
export const Deutschland = mongoose.model("deutschland-question", stateSchema);
