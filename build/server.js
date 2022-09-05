import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();
const app = express();
app.use(cors());
const PORT = process.env.PORT || 8000;
app.use(express.json());
app.get("/", (req, res) => {
    res.send("<h1>Deutschify Backend</h1>");
});
app.get("/user", (req, res) => {
    res.send(user);
});
const user = {
    firstName: "Hendrick",
    lastName: "Denzmann",
    accessGroups: ['loggedInUsers', 'members']
};
console.log(user);
app.listen(PORT, () => {
    console.log(`Listening on port http://localhost:${PORT}`);
});
