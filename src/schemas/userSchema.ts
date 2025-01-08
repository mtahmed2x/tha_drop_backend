import { Document, Types } from "mongoose";
import { Gender } from "@shared/enum";

export type UserSchema = Document & {
  auth: Types.ObjectId;
  name: string;
  phoneNumber: string;
  address: string | null;
  dateOfBirth: string | null;
  gender: Gender | null;
  avatar: string;
  licensePhoto: string;
  isResturentOwner: boolean;
  resturentName?: string;
  schedule?: {
    day: string;
    isActive: boolean;
    startAt: number | null;
    endAt: number | null;
  }[];
  review?: {
    user: Types.ObjectId;
    name: string;
    avatar: string;
    rating: number;
    comment: string;
    createdAt: Date;
    updatedAt: Date;
  }[];
  averageRating: number;
};
