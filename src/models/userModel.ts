import { model, Schema } from "mongoose";
import { UserSchema } from "../schemas/userSchema";
import { Gender, NotificationType, RequestStatus, RequestType, Role } from "../shared/enum";

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
    default: "",
  },
  dateOfBirth: {
    type: String,
    default: "",
  },
  gender: {
    type: String,
    enum: Gender,
  },
  avatar: {
    type: String,
    default: "",
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
    default: "",
  },
  ratePerHour: {
    type: Number,
    default: 0,
  },
  averageRating: {
    type: Number,
    default: 0,
  },
  totalReviews: {
    type: Number,
    default: 0,
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
          min: [1, "Rating must be at least 1"],
          max: [5, "Rating must not exceed 5"],
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
        cover: {
          type: String,
          required: true,
        },
        map: {
          location: {
            type: String,
            required: true,
          },
          latitude: {
            type: Number,
            required: true,
          },
          longitude: {
            type: Number,
            required: true,
          },
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
        eventDate: {
          type: Date,
          required: true,
        },
      },
    ],
  },
  requests: {
    type: [
      {
        id: {
          type: String,
          required: true,
        },
        types: {
          type: String,
          required: true,
          enum: RequestType,
        },
        status: {
          type: String,
          required: true,
          enum: RequestStatus,
        },
        date: {
          type: Date,
          required: true,
        },
        schedule: {
          startAt: {
            type: String,
          },
          endAt: {
            type: String,
          },
        },
        map: {
          location: {
            type: String,
          },
          latitude: {
            type: Number,
            required: true,
          },
          longitude: {
            type: Number,
            required: true,
          },
        },
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
          min: [0, "Rating must be at least 0"],
          max: [5, "Rating must not exceed 5"],
        },
        cost: {
          type: Number,
        },
      },
    ],
  },
  notifications: {
    type: [
      {
        types: {
          type: String,
          required: true,
          enum: NotificationType,
        },
        metadata: {
          eventTitle: {
            type: String,
            required: true,
          },
          eventId: {
            type: Schema.Types.ObjectId,
            ref: "Event",
            required: true,
          },
        },
      },
    ],
  },
});

const User = model<UserSchema>("User", userSchema);
export default User;
