import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";

import bcrypt from "bcrypt";
import crypto from "crypto";
import { createTransport } from "nodemailer";

import session from "express-session";
import cookieParser from "cookie-parser";

import { User } from "./models/User.js";

import { BadenWuerttemberg } from "./models/States.js";
import { Bayern } from "./models/States.js";
import { Berlin } from "./models/States.js";
import { Brandenburg } from "./models/States.js";
import { Bremen } from "./models/States.js";
import { Hamburg } from "./models/States.js";
import { Hessen } from "./models/States.js";
import { MecklenburgVorpommern } from "./models/States.js";
import { Niedersachsen } from "./models/States.js";
import { NordrheinWestfalen } from "./models/States.js";
import { RheinlandPfalz } from "./models/States.js";
import { Saarland } from "./models/States.js";
import { Sachsen } from "./models/States.js";
import { SachsenAnhalt } from "./models/States.js";
import { SchleswigHolstein } from "./models/States.js";
import { Thueringen } from "./models/States.js";

// const users = getUsers();

dotenv.config();

mongoose.connect(process.env.MONGODB_URI);

const app = express();

const PORT = process.env.PORT || 8000;

app.use(
    cors({
        origin: process.env.FRONTEND_BASE_URL,
        methods: ["POST", "PUT", "GET", "OPTIONS", "HEAD"],
        credentials: true,
    })
);

app.set("trust proxy", 1);

app.use(express.json());

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
    "/baden-wuerttemberg",
    async (req: express.Request, res: express.Response) => {
        const badenWuerttemberg = await BadenWuerttemberg.find({});
        res.send(badenWuerttemberg);
    }
);

app.get("/bayern", async (req: express.Request, res: express.Response) => {
    const bayern = await Bayern.find({});
    res.send(bayern);
});

app.get("/berlin", async (req: express.Request, res: express.Response) => {
    const berlin = await Berlin.find({});
    res.send(berlin);
});

app.get("/brandenburg", async (req: express.Request, res: express.Response) => {
    const brandenburg = await Brandenburg.find({});
    res.send(brandenburg);
});

app.get("/bremen", async (req: express.Request, res: express.Response) => {
    const bremen = await Bremen.find({});
    res.send(bremen);
});

app.get("/hamburg", async (req: express.Request, res: express.Response) => {
    const hamburg = await Hamburg.find({});
    res.send(hamburg);
});

app.get("/hessen", async (req: express.Request, res: express.Response) => {
    const hessen = await Hessen.find({});
    res.send(hessen);
});

app.get(
    "/mecklenburg-vorpommern",
    async (req: express.Request, res: express.Response) => {
        const mecklenburgVorpommern = await MecklenburgVorpommern.find({});
        res.send(mecklenburgVorpommern);
    }
);

app.get(
    "/niedersachsen",
    async (req: express.Request, res: express.Response) => {
        const niedersachsen = await Niedersachsen.find({});
        res.send(niedersachsen);
    }
);

app.get(
    "/nordrhein-westfalen",
    async (req: express.Request, res: express.Response) => {
        const nordrheinWestfalen = await NordrheinWestfalen.find({});
        res.send(nordrheinWestfalen);
    }
);

app.get(
    "/rheinland-pfalz",
    async (req: express.Request, res: express.Response) => {
        const rheinlandPfalz = await RheinlandPfalz.find({});
        res.send(rheinlandPfalz);
    }
);

app.get("/saarland", async (req: express.Request, res: express.Response) => {
    const saarland = await Saarland.find({});
    res.send(saarland);
});

app.get("/sachsen", async (req: express.Request, res: express.Response) => {
    const sachsen = await Sachsen.find({});
    res.send(sachsen);
});

app.get(
    "/sachsen-anhalt",
    async (req: express.Request, res: express.Response) => {
        const sachsenAnhalt = await SachsenAnhalt.find({});
        res.send(sachsenAnhalt);
    }
);

app.get(
    "/schleswig-holstein",
    async (req: express.Request, res: express.Response) => {
        const schleswigHolstein = await SchleswigHolstein.find({});
        res.send(schleswigHolstein);
    }
);

app.get("/thueringen", async (req: express.Request, res: express.Response) => {
    const thueringen = await Thueringen.find({});
    res.send(thueringen);
});

// Omars ding

app.get("/rate-us", async (req: express.Request, res: express.Response) => {
    // const thueringen = await Thueringen.find({});
    res.send("<h1> rate us </h1>");
});

app.post("/rate-us", async (req: express.Request, res: express.Response) => {
    const { firstName, lastName, feedback } = req.body;
    res.send(req.body);
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

app.get("/current-user", (req: express.Request, res: express.Response) => {
    const user = req.session.user;

    if (user) {
        res.send({
            currentUser: user,
        });
    } else {
        logAnonymousUserIn(req, res);
    }
});

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

app.get("/logout", (req: express.Request, res: express.Response) => {
    logAnonymousUserIn(req, res);
});

app.listen(PORT, () => {
    console.log(`Listening on port http://localhost:${PORT}`);
});
