import mongoose, { model, Schema, Document } from "mongoose";

export type Role = 'user' | 'admin' | 'client';

export interface User extends Document {
    email: string;
    password: string;
    name: string;
    role: Role;
}

const userSchema = new Schema<User>({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin', 'client'], default: 'user' }
});

export const userModel = model<User>("Users", userSchema);
