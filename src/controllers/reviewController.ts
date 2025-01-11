import to from "await-to-ts";
import createError from "http-errors";

import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import User from "@models/userModel";
import { Types } from "mongoose";

const create = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  const { targetId, rating, comment } = req.body;
  const userId = req.user.userId;
  let error, user, targetUser;

  [error, user] = await to(User.findById(userId));
  if (error) return next(error);
  if (!user) return next(createError(StatusCodes.NOT_FOUND, "Account not found"));

  [error, targetUser] = await to(User.findById(targetId));
  if (error) return next(error);
  if (!targetUser) return next(createError(StatusCodes.NOT_FOUND, "Account not found"));

  const review = {
    user: user._id as Types.ObjectId,
    name: user.name,
    avatar: user.avatar,
    rating: Number.parseInt(rating),
    comment: comment as string,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  targetUser.reviews = targetUser.reviews || [];
  targetUser.reviews.push(review);

  const totalReviews = targetUser.reviews.length;
  const avgRating = targetUser.reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews;
  targetUser.averageRating = avgRating;

  [error] = await to(targetUser.save());
  if (error) return next(error);

  return res.status(StatusCodes.CREATED).json({ success: true, message: "Success", data: review });
};

const update = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  const { targetId, rating, comment } = req.body;
  const userId = req.user.userId;

  if (rating && (rating < 1 || rating > 5)) {
    return next(createError(StatusCodes.BAD_REQUEST, "Rating must be between 1 and 5"));
  }

  let error, user, targetUser;

  [error, user] = await to(User.findById(userId));
  if (error) return next(error);
  if (!user) return next(createError(StatusCodes.NOT_FOUND, "Account not found"));

  [error, targetUser] = await to(User.findById(targetId));
  if (error) return next(error);
  if (!targetUser) return next(createError(StatusCodes.NOT_FOUND, "Account not found"));

  const reviewIndex = targetUser.reviews?.findIndex(
    (review) => review.user.toString() === (user._id as Types.ObjectId).toString()
  );

  if (reviewIndex === undefined || reviewIndex < 0 || targetUser.reviews?.length === 0) {
    return next(createError(StatusCodes.NOT_FOUND, "Review not found"));
  }

  targetUser.reviews![reviewIndex].rating = rating || targetUser.reviews![reviewIndex].rating;
  targetUser.reviews![reviewIndex].comment = comment || targetUser.reviews![reviewIndex].comment;
  targetUser.reviews![reviewIndex].updatedAt = new Date();

  if (rating) {
    const totalReviews = targetUser.reviews!.length;
    const avgRating = targetUser.reviews!.reduce((sum, review) => sum + review.rating, 0) / totalReviews;
    targetUser.averageRating = avgRating;
  }

  [error] = await to(targetUser.save());
  if (error) return next(error);

  return res.status(StatusCodes.OK).json({
    success: true,
    message: "Success",
    data: targetUser.reviews![reviewIndex],
  });
};

const ReviewController = {
  create,
  update,
};

export default ReviewController;
