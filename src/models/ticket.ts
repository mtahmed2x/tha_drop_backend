import { Document, Schema, model } from "mongoose";

export type TicketDocument = Document & {
  name: string;
  description: string;
  unitAmount: number;
  productId: string;
  priceId: string;
};

const TicketSchema = new Schema<TicketDocument>({
  name: {
    type: String,
    required: true,
    default: "free",
  },
  description: {
    type: String,
    required: true,
  },
  unitAmount: {
    type: Number,
    required: true,
    default: 0,
  },
  productId: {
    type: String,
    required: true,
    default: "",
  },
  priceId: {
    type: String,
    required: true,
    default: "",
  },
});

const Ticket = model<TicketDocument>("Ticket", TicketSchema);
export default Ticket;
