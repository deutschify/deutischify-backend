import bcrypt from 'bcrypt';
import crypto from "crypto";

// const createHash = async (password) => {
//     const salt = await bcrypt.genSalt();
//     const hash = await bcrypt.hash(password, salt);
//     return hash;
// };

// const passwords = ['ano123', 'hn123', 'an123'];

// passwords.forEach((password) => {
//     (async () => {
//         const hash = await createHash(password);
//         console.log(`${password} --> ${hash}`);
 
//         const passwordIsCorrect = await bcrypt.compare(
//             password,
//             String(hash)
//         );
//         console.log(passwordIsCorrect);
//     })();
// });

const getRandomConfirmationCode = () => {
    console.log(crypto.randomBytes(10).toString("hex")); 
};

getRandomConfirmationCode()