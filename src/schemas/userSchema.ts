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
    startAt: string | null;
    endAt: string | null;
  }[];
  reviews?: {
    user: Types.ObjectId;
    name: string;
    avatar: string;
    rating: number;
    comment: string;
    createdAt: Date;
    updatedAt: Date;
  }[];
  averageRating: number;
  stripeAccountId: string;
  stripeAccoutStatus: boolean;
  tickets?: {
    event: Types.ObjectId;
    title: string;
    description: string;
    location: string;
    date: Date;
    quantity: number;
    customId: string;
  }[];
  guests?: {
    user: Types.ObjectId;
    event: Types.ObjectId;
    name: string;
    avatar: string;
    quantity: number;
    eventTitle: string;
    location: string;
  }[];
};
