import { Document } from "mongoose";

export type AuthSchema = Document & {
  email: string,
  password: string,
  verificationOTP: string,
  verificationOTPExpire: Date | null,
  recoveryOTP: string,
  recoveryOTPExpire: Date | null,
  isVerified: boolean,
  isBlocked: boolean,
  isApproved: boolean
}