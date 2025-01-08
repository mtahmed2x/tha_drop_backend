import { ReviewSchema } from "@schemas/reviewSchema";
import { model, Schema } from "mongoose";

const reviewSchema = new Schema<ReviewSchema>({
  user: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  target: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "User",
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
});

const Review = model<ReviewSchema>("Review", reviewSchema);
export default Review;
