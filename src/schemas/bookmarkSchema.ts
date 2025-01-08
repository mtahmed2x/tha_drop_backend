import { Document, Types } from "mongoose";

export type BookmarkSchema = Document & {
  user: Types.ObjectId;
  event: Types.ObjectId[];
};
