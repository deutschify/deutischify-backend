import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import session from "express-session";
import cookieParser from "cookie-parser";
import { getUsers } from "./models.js";
const users = getUsers();
dotenv.config();
const app = express();
app.use(cors());
const PORT = process.env.PORT || 8000;
app.use(express.json());
app.use(session({
    resave: true,
    saveUninitialized: true,
    secret: "tempsecret",
}));
app.use(cookieParser());
app.get("/", (req, res) => {
    res.send("<h1>Deutschify Backend</h1>");
});
app.get("/users", (req, res) => {
    res.send(users);
});
app.get("/rate-us", (req, res) => {
    res.send("<h1>Rate us</h1>");
});
// functions for loging in and out
const loginSecondsMax = 10;
const logAnonymousUserIn = (req, res) => {
    const user = users.find((user) => user.email === 'anonymousUser');
    if (user) {
        req.session.user = user;
        req.session.cookie.expires = new Date(Date.now() + loginSecondsMax * 1000);
        req.session.save();
        res.send({
            "currentUser": user
        });
    }
    else {
        res.status(500).send('bad login');
    }
};
const logUserIn = (email, password, req, res) => {
    let user = users.find((user) => user.email === email && user.password === password);
    if (user) {
        req.session.user = user;
        req.session.cookie.expires = new Date(Date.now() + loginSecondsMax * 1000);
        req.session.save();
        res.send({
            "currentUser": user
        });
    }
    else {
        // res.status(500).send('bad login');
        // res.send("Check your email and password");
        logAnonymousUserIn(req, res);
    }
};
app.post("/login", (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    logUserIn(email, password, req, res);
});
app.get('/current-user', (req, res) => {
    const user = req.session.user;
    if (user) {
        res.send({
            "currentUser": user
        });
    }
    else {
        logAnonymousUserIn(req, res);
    }
});
app.get('/logout', (req, res) => {
    logAnonymousUserIn(req, res);
});
app.listen(PORT, () => {
    console.log(`Listening on port http://localhost:${PORT}`);
});
