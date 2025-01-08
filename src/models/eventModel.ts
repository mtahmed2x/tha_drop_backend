import { model, Schema } from "mongoose";
import { EventSchema } from "@schemas/eventSchemas";

const eventSchema = new Schema<EventSchema>(
  {
    title: {
      type: String,
      required: true,
    },
    organizer: {
      type: String,
      required: true,
    },
    host: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    subCategory: {
      type: Schema.Types.ObjectId,
      ref: "SubCategory",
      required: true,
    },
    date: {
      type: Date,
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
    gallery: [
      {
        type: String,
      },
    ],
    ticketPrice: {
      type: Number,
      required: true,
    },
    ticketPriceId: {
      type: String,
      required: true,
    },
    deadline: {
      type: Date,
      required: true,
    },
    availableTickets: {
      type: Number,
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
  },
  { timestamps: true }
);

const Event = model<EventSchema>("Event", eventSchema);
export default Event;
