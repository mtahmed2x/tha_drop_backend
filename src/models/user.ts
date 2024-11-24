import { Document, Schema, Types, model } from "mongoose";

export type UserDocument = Document & {
  auth: Types.ObjectId;
  name: string;
  dateOfBirth: string;
  gender: string;
  contact: string;
  address: string;
  subscriptionType: string;
};

export type DecodedUser = {
  authId: string;
  userId: string;
  name: string;
  isVerified: boolean;
  isBlocked: boolean;
  email: string;
  role: "GUEST" | "HOST" | "DJ" | "BARTENDER" | "BOTTLEGIRL";
  creatorId?: string;
};

const userSchema = new Schema<UserDocument>(
  {
    auth: {
      type: Schema.Types.ObjectId,
      ref: "Auth",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    dateOfBirth: {
      type: "String",
      required: true,
    },
    gender: {
      type: String,
    },
    contact: {
      type: "String",
    },
    address: {
      type: "String",
      required: true,
    },
    subscriptionType: {
      type: String,
      default: "free",
    },
  },
  { timestamps: true }
);

const User = model<UserDocument>("User", userSchema);
export default User;
