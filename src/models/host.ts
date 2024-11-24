import { Document, Schema, Types, model } from "mongoose";

export type HostDocument = Document & {
  auth: Types.ObjectId;
  user: Types.ObjectId;
  stripeAccoundId: string;
};

const schema = new Schema<HostDocument>({
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

const Host = model<HostDocument>("Host", schema);
export default Host;
