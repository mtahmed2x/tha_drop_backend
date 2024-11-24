import { Document, Schema, Types, model } from "mongoose";

export type GuestDocument = Document & {
  auth: Types.ObjectId;
  user: Types.ObjectId;
  stripeAccoundId: string;
};

const schema = new Schema<GuestDocument>({
  auth: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  user: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  stripeAccoundId: {
    type: String,
    required: true,
  },
});

const Guest = model<GuestDocument>("Guest", schema);
export default Guest;
