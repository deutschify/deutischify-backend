import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
const port = 8000;

app.use(express.json());

app.get("/", (req, res) => {
    res.send("<h1>Deutschify backend</h1>")
})

app.listen(port, () => {
    console.log(`Listening on port http://localhost:${port}`);
})