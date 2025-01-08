import Review from "@models/reviewModel";
import to from "await-to-ts";

import createError from "http-errors";

import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";

const create = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  const { userId, targetId, rating, comment } = req.body;
  const [error, review] = await to(Review.create({ user: userId, target: targetId, rating, comment }));
  if (error) return next(error);
  return res.status(StatusCodes.CREATED).json({ success: true, message: "Success", data: review });
};

const update = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  const id = req.params.id;
  const { rating, comment } = req.body;
  let error, review;
  [error, review] = await to(Review.findById(id));
  if (error) return next(error);
  if (!review) return next(createError(StatusCodes.NOT_FOUND, "Review not found"));

  review.rating = rating || review.rating;
  review.comment = comment || review.comment;

  [error] = await to(review.save());
  if (error) return next(error);

  return res.status(StatusCodes.OK).json({ success: true, message: "Success", data: review });
};

const ReviewController = {
  create,
  update,
};

export default ReviewController;
