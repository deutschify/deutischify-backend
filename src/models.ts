import { IUser } from "./interfaces.js";

export const getUsers = (): IUser[] => {
    return [
        {
            email: "hendrick@gmail.com",
            password: "123d",
            accessGroups: ["loggedInUsers", "members"],
        },
        {
            email: "anonymousUser",
            password: "Anonymous",
            accessGroups: ["loggedOutUsers"],
        },
        {
            email: "hd@gmail.com",
            password: "Hendrick",
            accessGroups: ["loggedInUsers", "members"],
        },
        {
            email: "an@gmail.com",
            password: "Andrea",
            accessGroups: ["loggedInUsers", "members"],
        },
    ];
};
