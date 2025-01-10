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
          type: String,
        },
        endAt: {
          type: String,
        },
      },
    ],
    required: false,
  },
  reviews: {
    type: [
      {
        user: {
          type: Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        name: {
          type: String,
          required: true,
        },
        avatar: {
          type: String,
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
  stripeAccountId: {
    type: String,
  },
  stripeAccoutStatus: {
    type: Boolean,
  },
  tickets: {
    type: [
      {
        event: {
          type: Schema.Types.ObjectId,
          ref: "Event",
          required: true,
        },
        title: {
          type: String,
          required: true,
        },
        description: {
          type: String,
          required: true,
        },
        location: {
          type: String,
          required: true,
        },
        date: {
          type: Date,
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
        },
        customId: {
          type: String,
          required: true,
        },
      },
    ],
    required: false,
  },

  guests: {
    type: [
      {
        user: {
          type: Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        event: {
          type: Schema.Types.ObjectId,
          ref: "Event",
          required: true,
        },
        name: {
          type: String,
          required: true,
        },
        avatar: {
          type: String,
        },
        quantity: {
          type: Number,
          required: true,
        },
        eventTitle: {
          type: String,
          required: true,
        },
        location: {
          type: String,
          required: true,
        },
      },
    ],
  },
});

const User = model<UserSchema>("User", userSchema);
export default User;
