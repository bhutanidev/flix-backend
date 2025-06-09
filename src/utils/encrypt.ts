import bcrypt from "bcrypt"

export const hashPassword = async (password: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        bcrypt.genSalt(12, (err, salt) => {
            if (err || !salt) {
                reject(err || new Error("Failed to generate salt"));
                return;
            }
            bcrypt.hash(password, salt, (err, hash) => {
                if (err || !hash) {
                    reject(err || new Error("Failed to hash password"));
                    return;
                }
                resolve(hash);
            });
        });
    });
};

export const comparePassword = async (password: string, hashed: string) => {
    return bcrypt.compare(password, hashed);
};