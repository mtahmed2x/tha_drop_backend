import Review from "@models/reviewModel";
import to from "await-to-ts";
import { Request, Response, NextFunction } from "express";

const getAverageRating = async (targetId: string): Promise<number> => {
  const [error, result] = await to(
    Review.aggregate([
      {
        $match: { target: targetId },
      },
      {
        $group: {
          _id: "$target",
          averageRating: { $avg: "$rating" },
        },
      },
    ])
  );
  if (error) throw error;

  if (result.length === 0) {
    return 0;
  }

  return result[0].averageRating;
};

const ReviewServices = {
  getAverageRating,
};

export default ReviewServices;
