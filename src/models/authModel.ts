import { Document, Schema, model } from "mongoose";

export type AuthDocument = Document & {
  email: string;
  password: string;
  verificationOTP: string;
  verificationOTPExpire: Date;
  isVerified: boolean;
  isBlocked: boolean;
};

const authSchema = new Schema<AuthDocument>({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  verificationOTP: {
    type: String,
    required: true,
  },
  verificationOTPExpire: {
    type: Date,
    required: true,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  isBlocked: {
    type: Boolean,
    default: false,
  },
});

const Auth = model<AuthDocument>("Auth", authSchema);
export default Auth;
