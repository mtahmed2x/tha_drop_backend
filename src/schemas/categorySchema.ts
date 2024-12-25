import { Document, Types } from "mongoose";

export type CategorySchema = Document & {
    title: string;
    categoryImage: string;
    subCategories: Types.ObjectId[];
};