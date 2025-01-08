import User from "@models/userModel";
import { NextFunction, Request, Response } from "express";
import to from "await-to-ts";
import { StatusCodes } from "http-status-codes";
import createError from "http-errors";
import TimeUtils from "@utils/tileUtils";

const updateSchedule = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  const userId = req.user.userId;
  const schedules = req.body.schedules;

  let error, user;
  [error, user] = await to(User.findById(userId));
  if (error) return next(error);
  if (!user) return next(createError(StatusCodes.NOT_FOUND, "Account not found"));

  type Schedule = {
    day: string;
    isActive: boolean;
    startAt: string;
    endAt: string;
  };

  schedules.forEach((schedule: Schedule) => {
    const day = schedule.day;
    const isActive = schedule.isActive;
    const startAt = schedule.startAt ? TimeUtils.parseTimeToMinutes(schedule.startAt) : null;
    const endAt = schedule.startAt ? TimeUtils.parseTimeToMinutes(schedule.endAt) : null;
    user.schedule?.push({ day, isActive, startAt, endAt });
  });

  [error] = await to(user.save());
  if (error) return next(error);

  res.status(StatusCodes.OK).json({ success: true, message: "Success", data: user });
};

const getReviews = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  const userId = req.body.userId || req.user.userId;

  const [error, user] = await to(User.findById(userId));
  if (error) return next(error);
  if (!user) return next(createError(StatusCodes.NOT_FOUND, "Account not found"));

  if (user.review?.length === 0) {
    return res
      .status(StatusCodes.OK)
      .json({ success: true, message: "Success", data: { totalReviews: 0, avgRating: 0 } });
  }

  const totalReviews = user.review!.length;
  const avgRating = user.review!.reduce((sum, review) => sum + review.rating, 0) / totalReviews;

  return res
    .status(StatusCodes.OK)
    .json({ success: true, message: "Success", data: { totalReviews, avgRating, reviews: user.review } });
};

const UserServices = {
  updateSchedule,
  getReviews,
};

export default UserServices;
