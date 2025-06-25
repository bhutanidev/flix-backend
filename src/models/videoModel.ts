import mongoose, { model, Schema, Document } from "mongoose";

export interface Video extends Document {
    objectKey: string;
    title: string;
    description:string;
    thumbnailUrl:string;
}

const videoSchema = new Schema<Video>({
    objectKey: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    thumbnailUrl: { type: String, required: true },
});

export const videoModel = model<Video>("Videos", videoSchema);
