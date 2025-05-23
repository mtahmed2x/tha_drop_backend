import { Types } from "mongoose";

export type ReviewSchema = {
  user: Types.ObjectId;
  target: Types.ObjectId;
  rating: number;
  comment: string;
};
