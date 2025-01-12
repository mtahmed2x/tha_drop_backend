import { Document, Types } from "mongoose";
import { Gender, RequestStatus, RequestType } from "@shared/enum";

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
  averageRating: number;
  stripeAccountId: string;
  stripeAccoutStatus: boolean;
  schedule?: {
    day: string;
    isActive: boolean;
    startAt: number | null;
    endAt: number | null;
  }[];
  reviews?: {
    user: Types.ObjectId;
    name: string;
    avatar?: string;
    rating: number;
    comment: string;
    createdAt: Date;
    updatedAt: Date;
  }[];
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
    avatar?: string;
    quantity: number;
    eventTitle: string;
    location: string;
  }[];
  requests: {
    types: RequestType;
    status: RequestStatus;
    date: Date;
    schedule: {
      startAt: string;
      endAt: string;
    };
    map: {
      location: string;
      latitude: number;
      longitude: number;
    };
    user: Types.ObjectId;
    name: string;
    avatar?: string;
    rating: number;
  }[];
};
