import { Document, Schema, Types, model } from "mongoose";

export type BartenderDocument = Document & {
  auth: Types.ObjectId;
  user: Types.ObjectId;
  stripeAccoundId: string;
};

const schema = new Schema<BartenderDocument>({
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

const Bartender = model<BartenderDocument>("Bartender", schema);
export default Bartender;
