import { Document, Types } from "mongoose";

export type SubCategorySchema = Document & {
    title: string;
    subCategoryImage: string;
    events: Types.ObjectId[];
};