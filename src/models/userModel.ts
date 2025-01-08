import { model, Schema } from "mongoose";
import { UserSchema } from "../schemas/userSchema";
import { Gender, Role } from "../shared/enum";

const userSchema = new Schema<UserSchema>({
  auth: {
    type: Schema.Types.ObjectId,
    ref: "Auth",
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: String,
    required: true,
  },
  address: {
    type: String,
  },
  dateOfBirth: {
    type: String,
  },
  gender: {
    type: String,
    enum: Gender,
  },
  avatar: {
    type: String,
  },
  licensePhoto: {
    type: String,
    required: true,
  },
  isResturentOwner: {
    type: Boolean,
    default: false,
  },
  resturentName: {
    type: String,
  },
  schedule: {
    type: [
      {
        day: {
          type: String,
          required: true,
        },
        isActive: {
          type: Boolean,
          required: true,
        },
        startAt: {
          type: Number,
        },
        endAt: {
          type: Number,
        },
      },
    ],
    required: false,
  },
  review: {
    type: [
      {
        user: {
          type: Schema.Types.ObjectId,
          ref: "User",
          required: true,
          unique: true,
        },
        name: {
          type: String,
          required: true,
        },
        avatar: {
          type: String,
          required: true,
        },
        rating: {
          type: Number,
          required: true,
          min: [1, "Star rating must be at least 1"],
          max: [5, "Star rating must not exceed 5"],
        },
        comment: {
          type: String,
        },
        createdAt: {
          type: Date,
          required: true,
        },
        updatedAt: {
          type: Date,
          required: true,
        },
      },
    ],
  },
});

const User = model<UserSchema>("User", userSchema);
export default User;
