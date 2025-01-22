import User from "@models/userModel";
import { NextFunction, Request, Response } from "express";
import to from "await-to-ts";
import { StatusCodes } from "http-status-codes";
import createError from "http-errors";
import TimeUtils from "@utils/tileUtils";
import Stripe from "stripe";
import { RequestType } from "@shared/enum";
import Event from "@models/eventModel";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const getMyTickets = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  const userId = req.user.userId;
  const [error, user] = await to(User.findById(userId));
  if (error) return next(error);
  if (!user) return next(createError(StatusCodes.NOT_FOUND, "User not found"));

  return res.status(StatusCodes.OK).json({ success: true, message: "Success", data: user.tickets });
};

const getMyGuests = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  const userId = req.user.userId;
  const [error, user] = await to(User.findById(userId));
  if (error) return next(error);
  if (!user) return next(createError(StatusCodes.NOT_FOUND, "User not found"));

  return res.status(StatusCodes.OK).json({ success: true, message: "Success", data: user.guests });
};

const getMySchedules = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  const userId = req.user.userId;

  const [error, user] = await to(User.findById(userId).lean());
  if (error) return next(error);
  if (!user) return next(createError(StatusCodes.NOT_FOUND, "User not found"));

  const schedules = user.schedule?.map((schedule) => {
    const startAtConverted = schedule.startAt !== null ? TimeUtils.parseMinutesToTime(schedule.startAt) : null;
    const endAtConverted = schedule.endAt !== null ? TimeUtils.parseMinutesToTime(schedule.endAt) : null;

    return {
      ...schedule,
      startAt: startAtConverted,
      endAt: endAtConverted,
    };
  });

  return res.status(StatusCodes.OK).json({ success: true, message: "Success", data: schedules });
};

const getMyEvents = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const userId = req.user.userId;
  const [error, events] = await to(
    Event.find({ host: userId })
      .populate({ path: "host", select: "name" })
      .populate({ path: "category", select: "title" })
      .populate({ path: "subCategory", select: "title" })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean()
  );
  if (error) return next(error);
  if (events.length === 0)
    return res.status(StatusCodes.OK).json({ success: true, message: "No event found", data: events });
  return res.status(StatusCodes.OK).json({ success: true, message: "Success", data: events });
};

const getMyRequests = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  const userId = req.user.userId;
  try {
    const user = await User.findById(userId).lean();
    if (!user) return next(createError(StatusCodes.NOT_FOUND, "User not found"));

    const sentRequests = user.requests?.filter((request) => request.types === RequestType.SENT) || [];
    const receivedRequests = user.requests?.filter((request) => request.types === RequestType.RECIEVED) || [];

    return res.status(StatusCodes.OK).json({
      success: true,
      message: "Success",
      data: { sentRequests, receivedRequests },
    });
  } catch (error) {
    return next(error);
  }
};

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

const getMyReviews = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  const userId = req.body.userId || req.user.userId;

  const [error, user] = await to(User.findById(userId));
  if (error) return next(error);
  if (!user) return next(createError(StatusCodes.NOT_FOUND, "Account not found"));

  if (user.reviews?.length === 0) {
    return res
      .status(StatusCodes.OK)
      .json({ success: true, message: "Success", data: { totalReviews: 0, avgRating: 0 } });
  }

  const totalReviews = user.reviews!.length;
  const avgRating = user.reviews!.reduce((sum, review) => sum + review.rating, 0) / totalReviews;

  return res
    .status(StatusCodes.OK)
    .json({ success: true, message: "Success", data: { totalReviews, avgRating, reviews: user.reviews } });
};

const UserServices = {
  updateSchedule,
  getMyEvents,
  getMyRequests,
  getMyTickets,
  getMyGuests,
  getMySchedules,
  getMyReviews,
};

export default UserServices;
