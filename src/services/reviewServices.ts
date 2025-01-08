import Review from "@models/reviewModel";
import to from "await-to-ts";
import { Request, Response, NextFunction } from "express";

const getAverageRating = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  const { targetId } = req.body.targetId;
  const [error, avgRating] = await to(
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
};

const getAllReview = async (req: Request, res: Response, next: NextFunction): Promise<any> => {};
