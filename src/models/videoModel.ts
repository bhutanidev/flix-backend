import mongoose, { model, Schema, Document } from "mongoose";

export interface Video extends Document {
    objectKey: string;
    title: string;
}

const videoSchema = new Schema<Video>({
    objectKey: { type: String, required: true, unique: true },
    title: { type: String, required: true }
});

export const videoModel = model<Video>("Videos", videoSchema);
