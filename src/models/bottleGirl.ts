import { Document, Schema, Types, model } from "mongoose";

export type BottleGirlDocument = Document & {
  auth: Types.ObjectId;
  user: Types.ObjectId;
  stripeAccoundId: string;
};

const schema = new Schema<BottleGirlDocument>({
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

const BottleGirl = model<BottleGirlDocument>("BottleGirl", schema);
export default BottleGirl;
