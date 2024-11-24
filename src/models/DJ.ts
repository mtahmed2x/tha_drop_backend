import { Document, Schema, Types, model } from "mongoose";

export type DJDocument = Document & {
  auth: Types.ObjectId;
  user: Types.ObjectId;
  stripeAccoundId: string;
};

const schema = new Schema<DJDocument>({
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

const DJ = model<DJDocument>("DJ", schema);
export default DJ;
