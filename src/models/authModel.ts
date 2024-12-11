import { Schema, model } from "mongoose";
import { AuthSchema } from "../schemas/authSchema";

const authSchema = new Schema<AuthSchema>({
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  verificationOTP: {
    type: String,
    required: true
  },
  verificationOTPExpire: {
    type: Date,
    required: true
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
