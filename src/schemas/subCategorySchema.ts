import { Document, Types } from "mongoose";

export type SubCategorySchema = Document & {
    title: string;
    events: Types.ObjectId[];
};