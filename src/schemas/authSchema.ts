import { Role } from "@shared/enum";
import { Document } from "mongoose";

export type AuthSchema = Document & {
  email: string,
  password: string,
  role: Role,
  license: string,
  verificationOTP: string,
  verificationOTPExpire: Date | null,
  recoveryOTP: string,
  recoveryOTPExpire: Date | null,
  isVerified: boolean,
  isBlocked: boolean,
  isApproved: boolean
}