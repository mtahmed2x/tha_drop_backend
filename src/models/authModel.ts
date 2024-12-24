import { Schema, model } from "mongoose";
import { AuthSchema } from "../schemas/authSchema";
import { Role } from "@shared/enum";

const authSchema = new Schema<AuthSchema>({
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    required: true,
    enum: Role
  },
  license: {
    type: String,
    required: true,
  },
  verificationOTP: {
    type: String,
  },
  verificationOTPExpire: {
    type: Date,
    
  },
  recoveryOTP: {
    type: String
  },
  recoveryOTPExpire: {
    type: Date
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isBlocked: {
    type: Boolean,
    default: false
  },
  isApproved: {
    type: Boolean
  }
});

const Auth = model<AuthSchema>("Auth", authSchema);
export default Auth;
