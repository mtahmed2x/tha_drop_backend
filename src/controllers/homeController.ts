import to from "await-to-ts";
import e, { Request, Response, NextFunction } from "express";
import Event from "@models/eventModel";
import createError from "http-errors";
import { StatusCodes } from "http-status-codes";
import User from "@models/userModel";

const home = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  const userId = req.user.userId;

  let error, topEvents, latestEvents, users, user;
  [error, topEvents] = await to(Event.find().sort({ ticketSell: -1 }).select("title cover map _id").limit(15).lean());
  if (error) return next(error);
  let top5, top10;
  if (topEvents.length === 15) {
    top5 = topEvents.slice(0, 5);
    top10 = topEvents.slice(5, 10);
  }
  if (topEvents.length > 5 && topEvents.length < 15) {
    top5 = topEvents.slice(0, 5);
    top10 = topEvents.filter((_, index) => index >= 5);
  }
  if (topEvents.length <= 5) {
    top5 = topEvents;
    top10 = [];
  }

  [error, latestEvents] = await to(Event.find().sort({ createdAt: -1 }).select("title cover map _id").limit(15).lean());
  if (error) return next(error);

  let totalReviews, avgRating;
  [error, user] = await to(User.findById(userId));
  if (error) return next(error);
  if (!user) return next(createError(StatusCodes.NOT_FOUND, "User Not found"));

  if (user.reviews?.length === 0) {
    totalReviews = 0;
    avgRating = 0;
  }
  totalReviews = user.reviews!.length;
  avgRating = user.reviews!.reduce((sum, review) => sum + review.rating, 0) / totalReviews;

  [error, users] = await to(User.find().sort({ averageRating: -1 }).select("name avatar _id").limit(15).lean());
  users.forEach((user) => {
    user.avatar = user.avatar ? user.avatar : "";
  });
  if (error) return next(error);

  if (users.length === 0)
    return res.status(StatusCodes.OK).json({
      success: true,
      message: "Success",
      data: { top5, top10, latestEvents, users: [], review: { totalReviews, avgRating } },
    });

  return res.status(StatusCodes.OK).json({
    success: true,
    message: "Success",
    data: { top5, top10, latestEvents, users, review: { totalReviews, avgRating } },
  });
};

const HommeController = {
  home,
};

export default HommeController;
