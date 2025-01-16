import { Document, Types } from "mongoose";
import { Gender, NotificationType, RequestStatus, RequestType } from "@shared/enum";

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
  ratePerHour?: number | null;
  averageRating: number;
  totalReviews: number;
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
    cover: string;
    map: {
      location?: string;
      latitude: number;
      longitude: number;
    };
    date: Date;
    quantity: number;
    customId: string;
  }[];
  guests?: {
    user: Types.ObjectId;
    event: Types.ObjectId;
    name: string;
    avatar: string | null;
    quantity: number;
    eventTitle: string;
    eventDate: Date;
  }[];
  requests?: {
    id: string;
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
    cost: number;
  }[];
  notifications?: {
    types: NotificationType;
    metadata: {
      eventTitle: string;
      eventId: Types.ObjectId;
    };
  }[];
};
