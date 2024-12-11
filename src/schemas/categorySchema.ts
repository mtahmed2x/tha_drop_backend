import { Document, Types } from "mongoose";

export type CategorySchema = Document & {
    title: string;
    subCategories: Types.ObjectId[];
};