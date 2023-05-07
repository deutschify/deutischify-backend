var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
app.use(cors({
    origin: process.env.FRONTEND_BASE_URL,
    methods: ["POST", "PUT", "GET", "OPTIONS", "HEAD", "DELETE"],
    credentials: true,
}));
app.set("trust proxy", 1);
app.use(express.json());
// Helmet can help us to stay secure
app.use(helmet());
//Morgan is a request middleware tool to tell us which request has been made and what was the result in the console
app.use(morgan("common"));
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
app.use(cookieParser());
app.use(session({
    resave: true,
    saveUninitialized: true,
    secret: process.env.SESSION_SECRET,
    cookie: {
        httpOnly: true,
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        secure: process.env.NODE_ENV === "production",
    },
}));
const ensureSafeOrigin = (req, res, next) => {
    var _a;
    try {
        const safeOriginCode = (_a = req.body) === null || _a === void 0 ? void 0 : _a.safeOriginCode;
        if (safeOriginCode !== process.env.SAFE_ORIGIN_CODE) {
            console.log({ safeOriginCode });
            res.status(500).send("no access");
        }
        else {
            next();
        }
    }
    catch (e) {
        res.status(500).send("no access");
    }
};
app.all("/", function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "http://localhost:3000");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    next();
});
app.get("/users", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const users = yield User.find({});
    res.send(users);
}));
app.get("/all-questions", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    // const { category } = req.params;
    const deutschland = yield Deutschland.find();
    res.send(deutschland);
}));
app.get("/all-questions/:category", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { category } = req.params;
    // const deutschland = await Deutschland.find({ category } );
    // const deutschland = await Deutschland.find({ $and: [ { category }, { category:"deutschland" } ] })
    const deutschland = yield Deutschland.find({
        category: { $in: ["deutschland", `${category}`] },
    })
        .sort({ number: 1 })
        .collation({ locale: "en_US", numericOrdering: true });
    res.send(deutschland);
}));
// Omars ding
app.get("/rate-us", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // const thueringen = await Thueringen.find({});
    res.send("<h1> rate us </h1>");
}));
app.post("/rate-us", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
            user = Object.assign(Object.assign({}, user), { firstName, lastName, feedback });
        }
        else {
            logAnonymousUserIn(req, res);
        }
        console.log(user);
    }
    catch (err) {
        console.log(err);
    }
}));
// functions for loging in and out
const loginSecondsMax = 9000;
const logAnonymousUserIn = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield User.findOne({ email: "anonymousUser" });
    // const user = users.find((user) => user.email === 'anonymousUser');
    if (user) {
        req.session.user = user;
        req.session.cookie.expires = new Date(Date.now() + loginSecondsMax * 1000);
        req.session.save();
        res.send({
            currentUser: user,
        });
    }
    else {
        res.status(500).send("user is still logged in");
    }
});
const logUserIn = (email, password, req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield User.findOne({ email });
    // const user = await User.findOne({ email, password });
    if (user) {
        const passwordIsCorrect = yield bcrypt.compare(password, user.password);
        console.log(passwordIsCorrect);
        if (passwordIsCorrect) {
            req.session.user = user;
            req.session.cookie.expires = new Date(Date.now() + loginSecondsMax * 1000);
            req.session.save();
            res.send({
                currentUser: user,
            });
        }
        else {
            logAnonymousUserIn(req, res);
        }
    }
    else {
        logAnonymousUserIn(req, res);
    }
});
app.post("/login", ensureSafeOrigin, (req, res) => {
    var _a, _b;
    const email = (_a = req.body) === null || _a === void 0 ? void 0 : _a.email;
    const password = (_b = req.body) === null || _b === void 0 ? void 0 : _b.password;
    logUserIn(email, password, req, res);
});
// ein function für confirmationcode
const getRandomConfirmationCode = () => {
    return crypto.randomBytes(10).toString("hex");
};
app.post("/register", ensureSafeOrigin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Check if email is already registered
        const email = req.body.email;
        const emailInUse = yield User.findOne({ email });
        if (emailInUse) {
            res.send({
                message: "Email is registered!",
            });
        }
        else {
            const firstName = req.body.firstName;
            const lastName = req.body.lastName;
            const nationality = req.body.nationality;
            const confirmationCode = getRandomConfirmationCode();
            const language = req.body.language;
            const password = req.body.password;
            const salt = yield bcrypt.genSalt();
            const hash = yield bcrypt.hash(password, salt);
            const newUser = new User({
                firstName,
                lastName,
                password: hash,
                email,
                language,
                nationality,
                confirmationCode,
                imagePublicId: "c4nct0lzjndw2u69zbyx",
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
                }
                else {
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
        }
    }
    catch (e) {
        res.status(500).send(e);
    }
}));
app.get("/current-user", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let user = req.session.user;
    if (user) {
        // user = await User.findOne({ email: user.email });
        res.send({
            currentUser: user,
        });
    }
    else {
        logAnonymousUserIn(req, res);
    }
}));
//get a User
app.get("/users/:_id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield User.findById(req.params._id);
        res.status(200).json(user);
    }
    catch (err) {
        res.status(500).json(err);
    }
}));
app.post("/confirm-registration-code", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const confirmationCode = req.body.confirmationCode;
    const user = yield User.findOne({ confirmationCode });
    if (user) {
        console.log("yes user is found");
        user.accessGroups = ["loggedInUsers", "members"];
        user.save();
        req.session.user = user;
        req.session.cookie.expires = new Date(Date.now() + loginSecondsMax * 1000);
        console.log("session", req.session.user);
        console.log({ user });
        req.session.save();
        res.send({ userWasConfirmed: true });
    }
    else {
        res.send({ userWasConfirmed: false, user: "user not found" });
    }
}));
app.put("/update/:_id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { _id } = req.params;
    try {
        const updatedUser = yield User.findByIdAndUpdate(_id, req.body.dataToSend, {
            useFindAndModify: false,
            new: true,
        });
        if (!req.body.dataToSend) {
            res.status(404).send({
                message: "you can not update your profile while logged out",
            });
        }
        else {
            res.send(updatedUser);
        }
    }
    catch (error) {
        res.status(500).send(error || { message: "server error" });
    }
}));
//delete a user
// app.delete(
//     "/users/:_id",
//     async (req: express.Request, res: express.Response) => {
//         if (req.params._id === req.body._id || req.body.isAdmin) {
//             try {
//                 await User.findByIdAndDelete(req.params._id);
//                 res.status(200).json("account has been deleted");
//             } catch (err) {
//                 return res.status(500).json(err);
//             }
//         } else {
//             return res.status(403).json("You can't delete yourself");
//         }
//     }
// );
// get a User
app.get("/users/:_id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield User.findById(req.params._id);
        res.status(200).json(user);
    }
    catch (err) {
        res.status(500).json(err);
    }
}));
//Post Section
//Create a Post
app.post("/posts", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const newPost = new Post(req.body);
    try {
        const savedPost = yield newPost.save();
        res.status(200).json(savedPost);
    }
    catch (err) {
        res.status(500).json(err);
    }
}));
//Update a post
app.put("/posts/:_id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const post = yield Post.findById(req.params._id);
        if (post.userId === req.body.userId) {
            yield post.updateOne({ $set: req.body });
            res.status(200).json("Post has been updated");
        }
        else {
            res.status(403).json("you can't update the post");
        }
    }
    catch (err) {
        res.status(500).json(err);
    }
}));
//delete a post
app.delete("/posts/:_id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const post = yield Post.findById(req.params._id);
        console.log(post.userId);
        console.log(req.body.userId);
        if (post.userId === req.body.userId) {
            yield post.deleteOne();
            res.status(200).json("Post has been deleted");
        }
        else {
            res.status(403).json("you can't delete the post");
        }
    }
    catch (err) {
        res.status(500).json(err);
    }
}));
//Like and Dislike a Post
app.put("/posts/:_id/like", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const post = yield Post.findById(req.params._id);
        if (!post.likes.includes(req.body.userId)) {
            yield post.updateOne({ $push: { likes: req.body.userId } });
            res.status(200).json("Post has been liked");
        }
        else {
            yield post.updateOne({ $pull: { likes: req.body.userId } });
            res.status(200).json("Post has been disliked");
        }
    }
    catch (err) {
        res.status(500).json(err);
    }
}));
//Get a Post
app.get("/posts/:_id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const post = yield Post.findById(req.params._id);
        res.status(200).json(post);
    }
    catch (err) {
        res.status(500).json(err);
    }
}));
//Get all Posts
app.get("/posts/news-feed/all", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const posts = yield Post.find({});
    res.send(posts);
}));
//Comments Section
//Create a Comment
// app.post(
//     "/posts/:_id/comment",
//     async (req: express.Request, res: express.Response) => {
//         const newComment = new Comment(req.body);
//         try {
//             const savedComment = await newComment.save();
//             res.status(200).json(savedComment);
//         } catch (err) {
//             res.status(500).json(err);
//         }
//     }
// );
app.post("/posts/:_id/comment", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // const newComment = new Comment(req.body);
    try {
        // const savedComment = await newComment.save();
        const post = yield Post.findById(req.params._id);
        yield post.updateOne({ $push: { comments: req.body } });
        res.status(200).json("Comment has been added");
    }
    catch (err) {
        res.status(500).json(err);
    }
}));
// get all comments for a specific post
app.get("/posts/comments/:_id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const post = yield Post.findById(req.params._id);
        res.status(200).json(post.comments);
    }
    catch (err) {
        res.status(500).json(err);
    }
}));
//Get the comment Owner by passing the userId as a params
app.get("/posts/comment-owner/:_id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield User.findById(req.params._id);
        console.log(user);
        res.status(200).json(user);
    }
    catch (err) {
        res.status(500).json(err);
    }
}));
//Delete a comment
app.delete("/posts/comments/comment/:_id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // const requiredComment = await Comment.findById(req.params._id);
        // console.log("111");
        // console.log(requiredComment, "requiredComment");
        // const requiredCommentId = requiredComment._id.toString();
        // console.log(requiredCommentId, "requiredCommentId");
        // console.log("------");
        // COMMENT 5 WITHOUT COMMENT SCHEMA
        const requiredPost = yield Post.findOne({
            "comments._id": req.params._id,
        });
        console.log(requiredPost, "requiredPost");
        // console.log(requiredComment);
        // const requiredPost = await Post.findOne({
        //     "comments._id": requiredCommentId,
        // });
        // console.log(requiredPost, "requiredPost");
        const deletedComment = requiredPost.comments.filter((c) => {
            if (c._id.toString() === req.params._id) {
                return c._id;
            }
        });
        console.log(deletedComment, "deletedComment");
        const deletedCommentOwner = deletedComment.map((c) => {
            return c.userId;
        });
        console.log(deletedCommentOwner, "deletedCommentOwner");
        if (deletedCommentOwner.toString() === req.body.userId) {
            console.log("111");
            console.log("222");
            yield requiredPost.updateOne({
                $pull: {
                    comments: {
                        _id: req.params._id,
                    },
                },
            });
            console.log("333");
            res.status(200).json("Comment has been deleted");
        }
        else {
            res.status(403).json("you can't delete the comment");
        }
    }
    catch (err) {
        res.status(500).json(err);
    }
}));
//Update a comment
app.put("/posts/:postId/comments/comment/:commentId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const requiredPost = yield Post.findById(req.params.postId);
        console.log(requiredPost, "requiredPost");
        const comment = requiredPost.comments.id(req.params.commentId);
        if (comment.userId.toString() === req.body.userId) {
            console.log("111");
            console.log(req.body);
            comment.set(req.body);
            yield requiredPost.save();
            console.log("222");
            res.status(200).json("comment has been updated");
        }
        else {
            res.status(403).json("you can't update the comment");
        }
    }
    catch (err) {
        res.status(500).json(err);
    }
}));
// Get all my Posts
app.get("/posts/my-posts/:userId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield User.findById(req.params.userId);
        //console.log(user._id);
        const post = yield Post.find({
            userId: req.params.userId,
        });
        //console.log(post);
        res.status(200).json(post);
    }
    catch (err) {
        res.status(500).json(err);
    }
}));
app.get("/logout", (req, res) => {
    logAnonymousUserIn(req, res);
});
app.listen(PORT, () => {
    console.log(`Listening on port http://localhost:${PORT}`);
});
