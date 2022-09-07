import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";

import session from "express-session";
import cookieParser from "cookie-parser";

import { User } from "../models/User.js";
// const users = getUsers();

dotenv.config();

mongoose.connect(process.env.MONGODB_URI)
const app = express();
app.use(cors());
const PORT = process.env.PORT || 8000;

app.use(express.json());


declare module 'express-session' {
    export interface SessionData {
        user: { [key: string]: any };
    }
}

app.use(
    session({
        resave: true,
        saveUninitialized: true,
        secret: "tempsecret",
    })
);

app.use(cookieParser());

app.get('/', (req: express.Request, res: express.Response) => {
    res.send(`***${process.env.NODE_ENV}***`);
});


app.get("/users", (req: express.Request, res: express.Response) => {
    res.send(User);
});

// functions for loging in and out
const loginSecondsMax = 10;
 
const logAnonymousUserIn = async (req: express.Request, res: express.Response) => {

    const user = await User.findOne({email: 'anonymousUser'})
    // const user = users.find((user) => user.email === 'anonymousUser');
    if (user) {
        req.session.user = user;
        req.session.cookie.expires = new Date(Date.now() + loginSecondsMax * 1000);
        req.session.save();
        res.send({
            "currentUser": user
        });
    } else {
        res.status(500).send('bad login');
    }
}

const logUserIn = async (email: string, password: string, req: express.Request, res: express.Response) => {
    // let user = users.find((user) => user.email === email && user.password === password);
    const user = await User.findOne({ email, password });
    if (user) {
        req.session.user = user;
        req.session.cookie.expires = new Date(Date.now() + loginSecondsMax * 1000);
        req.session.save();
        res.send({
            "currentUser": user
        });
    } else {
        // res.status(500).send('bad login');
        // res.send("Check your email and password");
        logAnonymousUserIn(req, res);
    }
}

app.post("/login", (req: express.Request, res: express.Response) => {
    const email = req.body.email;
    const password = req.body.password;
    logUserIn(email, password, req, res);
})

app.get('/current-user', (req: express.Request, res: express.Response) => {
    const user = req.session.user;
    if (user) {
        res.send({
            "currentUser": user
        });
    } else {
        logAnonymousUserIn(req, res);
    }
});

app.get('/logout', (req: express.Request, res: express.Response) => {
    logAnonymousUserIn(req,res);
});

app.listen(PORT, () => {
    console.log(`Listening on port http://localhost:${PORT}`);
});


