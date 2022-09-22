import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cloudinary from "cloudinary";
import helmet from "helmet";
import morgan from "morgan";

import bcrypt from "bcrypt";
import crypto from "crypto";
import { createTransport } from "nodemailer";

import session from "express-session";
import cookieParser from "cookie-parser";

import { User } from "./models/User.js";
import { Deutschland } from "./models/States.js";
import { Post } from "./models/Post.js";

// const users = getUsers();

dotenv.config();

mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => {
        console.log("mongoDB is connected");
    })
    .catch((err) => {
        console.log(err);
    });

const app = express();

const PORT = process.env.PORT || 8000;

// in ordder to configure the cloudinary api
cloudinary.v2.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

app.use(
    cors({
        origin: process.env.FRONTEND_BASE_URL,
        methods: ["POST", "PUT", "GET", "OPTIONS", "HEAD"],
        credentials: true,
    })
);

app.set("trust proxy", 1);

app.use(express.json());

// Helmet can help us to stay secure
app.use(helmet());
//Morgan is a request middleware tool to tell us which request has been made and what was the result in the console
app.use(morgan("common"));

declare module "express-session" {
    export interface SessionData {
        user: { [key: string]: any };
    }
}

const transporter = createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    service: "gmail",
    auth: {
        type: "login",
        user: process.env.MAILER_ACCOUNT_NAME,
        pass: process.env.MAILER_ACCOUNT_PASSWORD,
    },
    tls: { rejectUnauthorized: false },
});

app.use(
    session({
        resave: true,
        saveUninitialized: true,
        secret: "tempsecret",
    })
);

app.use(cookieParser());

app.use(
    session({
        resave: true,
        saveUninitialized: true,
        secret: process.env.SESSION_SECRET,
        cookie: {
            httpOnly: true,
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
            secure: process.env.NODE_ENV === "production",
        },
    })
);

const ensureSafeOrigin = (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
) => {
    try {
        const safeOriginCode = req.body?.safeOriginCode;

        if (safeOriginCode !== process.env.SAFE_ORIGIN_CODE) {
            console.log({ safeOriginCode });
            res.status(500).send("no access");
        } else {
            next();
        }
    } catch (e) {
        res.status(500).send("no access");
    }
};

app.all("/", function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "http://localhost:3000");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    next();
});

// app.get("/", (req: express.Request, res: express.Response) => {
//     res.send(`***${process.env.NODE_ENV}***`);
// });

app.get("/users", async (req: express.Request, res: express.Response) => {
    const users = await User.find({});
    res.send(users);
});

app.get(
    "/all-questions",
    async (req: express.Request, res: express.Response, next) => {
        // const { category } = req.params;
        const deutschland = await Deutschland.find();
        res.send(deutschland);
    }
);

app.get(
    "/all-questions/:category",
    async (req: express.Request, res: express.Response, next) => {
        const { category } = req.params;
        // const deutschland = await Deutschland.find({ category } );
        // const deutschland = await Deutschland.find({ $and: [ { category }, { category:"deutschland" } ] })
        const deutschland = await Deutschland.find({
            category: { $in: ["deutschland", `${category}`] },
        })
            .sort({ number: 1 })
            .collation({ locale: "en_US", numericOrdering: true });
        res.send(deutschland);
    }
);

// Omars ding

app.get("/rate-us", async (req: express.Request, res: express.Response) => {
    // const thueringen = await Thueringen.find({});
    res.send("<h1> rate us </h1>");
});

app.post("/rate-us", async (req: express.Request, res: express.Response) => {
    // const { firstName, lastName, feedback } = req.body;
    // res.send(req.body);
    try {
        let user = req.session.user;
        if (user) {
            res.send({
                currentUser: user,
            });
            const firstName = req.body.firstName;
            const lastName = req.body.lastName;
            const feedback = req.body.feedback;
            user = { ...user, firstName, lastName, feedback };
        } else {
            logAnonymousUserIn(req, res);
        }

        console.log(user);
    } catch (err) {
        console.log(err);
    }
});

// functions for loging in and out
const loginSecondsMax = 10;

const logAnonymousUserIn = async (
    req: express.Request,
    res: express.Response
) => {
    const user = await User.findOne({ email: "anonymousUser" });

    // const user = users.find((user) => user.email === 'anonymousUser');
    if (user) {
        req.session.user = user;
        req.session.cookie.expires = new Date(
            Date.now() + loginSecondsMax * 1000
        );
        req.session.save();
        res.send({
            currentUser: user,
        });
    } else {
        res.status(500).send("bad login");
    }
};

const logUserIn = async (
    email: string,
    password: string,
    req: express.Request,
    res: express.Response
) => {
    const user = await User.findOne({ email });

    // const user = await User.findOne({ email, password });

    if (user) {
        const passwordIsCorrect = await bcrypt.compare(password, user.password);
        console.log(passwordIsCorrect);

        if (passwordIsCorrect) {
            req.session.user = user;
            req.session.cookie.expires = new Date(
                Date.now() + loginSecondsMax * 1000
            );
            req.session.save();
            res.send({
                currentUser: user,
            });
        } else {
            logAnonymousUserIn(req, res);
        }
    } else {
        logAnonymousUserIn(req, res);
    }
};

app.post(
    "/login",
    ensureSafeOrigin,
    (req: express.Request, res: express.Response) => {
        const email = req.body?.email;
        const password = req.body?.password;
        logUserIn(email, password, req, res);
    }
);

// ein function für confirmationcode
const getRandomConfirmationCode = () => {
    return crypto.randomBytes(10).toString("hex");
};

app.post(
    "/register",
    ensureSafeOrigin,
    async (req: express.Request, res: express.Response) => {
        try {
            const firstName = req.body.firstName;
            const lastName = req.body.lastName;
            const email = req.body.email;
            const nationality = req.body.nationality;
            const confirmationCode = getRandomConfirmationCode();
            const language = req.body.language;
            const password = req.body.password;

            const salt = await bcrypt.genSalt();
            const hash = await bcrypt.hash(password, salt);

            const newUser = new User({
                firstName,
                lastName,
                password: hash,
                email,
                language,
                nationality,
                confirmationCode,
                accessGroups: ["loggedInUsers", "unconfirmedMembers"],
            });

            newUser.save();

            // send confirmation email to user
            const confirmUrl = `${process.env.FRONTEND_BASE_URL}/confirm-registration/${confirmationCode}`;
            const mailOptions = {
                from: `Deutschify Der Integrationscoach <${process.env.MAILER_ACCOUNT_NAME}@gmail.com>`,
                to: email,
                subject: "Please confirm your registration",
                html: `
	<h1>Thank you for your registration!</h1>
	<p>We appreciate your membership!</p>
	<p>Please click here to confirm your registration: <a href="${confirmUrl}">${confirmUrl}</a></p>`,
            };
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.log(error);
                } else {
                    console.log("Email sent: " + info.response);
                }
            });

            res.send({
                message: "user created",
                user: {
                    firstName,
                    lastName,
                    email,
                },
            });
        } catch (e) {
            // res.status(500).send(e);
        }
    }
);

app.get(
    "/current-user",
    async (req: express.Request, res: express.Response) => {
        let user = req.session.user;

        if (user) {
            // user = await User.findOne({ email: user.email });
            res.send({
                currentUser: user,
            });
        } else {
            logAnonymousUserIn(req, res);
        }
    }
);

app.post(
    "/confirm-registration-code",
    async (req: express.Request, res: express.Response) => {
        const confirmationCode = req.body.confirmationCode;

        const user = await User.findOne({ confirmationCode });
        if (user) {
            user.accessGroups = ["loggedInUsers", "members"];
            user.save();
            req.session.user = user;
            req.session.cookie.expires = new Date(
                Date.now() + loginSecondsMax * 1000
            );
            req.session.save();
            res.send({ userWasConfirmed: true });
        } else {
            res.send({ userWasConfirmed: false });
        }
    }
);

//Update User Info

app.put("/users/:_id", async (req: express.Request, res: express.Response) => {
    if (req.params._id === req.body._id || req.body.isAdmin) {
        if (req.body.password) {
            try {
                const salt = await bcrypt.genSalt();
                req.body.password = await bcrypt.hash(req.body.password, salt);
            } catch (err) {
                return res.status(500).json(err);
            }
        }
        try {
            const user = await User.findByIdAndUpdate(req.params._id, {
                $set: req.body,
            });
            res.status(200).json("account has been updated");
        } catch (err) {
            return res.status(500).json(err);
        }
    } else {
        return res.status(403).json("You can't update yourself");
    }
});

//delete a user

app.delete(
    "/users/:_id",
    async (req: express.Request, res: express.Response) => {
        if (req.params._id === req.body._id || req.body.isAdmin) {
            try {
                await User.findByIdAndDelete(req.params._id);
                res.status(200).json("account has been deleted");
            } catch (err) {
                return res.status(500).json(err);
            }
        } else {
            return res.status(403).json("You can't delete yourself");
        }
    }
);

//get a User
app.get("/users/:_id", async (req: express.Request, res: express.Response) => {
    try {
        const user = await User.findById(req.params._id);
        res.status(200).json(user);
    } catch (err) {
        res.status(500).json(err);
    }
});

//Post Bereich

//Create a Post
app.post("/posts", async (req: express.Request, res: express.Response) => {
    const newPost = new Post(req.body);
    try {
        const savedPost = await newPost.save();
        res.status(200).json(savedPost);
    } catch (err) {
        res.status(500).json(err);
    }
});

//Update a post
app.put("/posts/:_id", async (req: express.Request, res: express.Response) => {
    try {
        const post = Post.findById(req.params._id);
        if (req.params._id === req.body._id) {
            await post.updateOne({ $set: req.body });
            res.status(200).json("Post has been updated");
        } else {
            res.status(403).json("you can't update the post");
        }
    } catch (err) {
        res.status(500).json(err);
    }
});

//delete a post
app.delete(
    "/posts/:_id",
    async (req: express.Request, res: express.Response) => {
        try {
            const post = Post.findById(req.params._id);
            if (req.params._id === req.body._id) {
                await post.deleteOne();
                res.status(200).json("Post has been deleted");
            } else {
                res.status(403).json("you can't delete the post");
            }
        } catch (err) {
            res.status(500).json(err);
        }
    }
);

//Like a Post
//Get a Post
//Get all Posts

app.get("/logout", (req: express.Request, res: express.Response) => {
    logAnonymousUserIn(req, res);
});

app.listen(PORT, () => {
    console.log(`Listening on port http://localhost:${PORT}`);
});
