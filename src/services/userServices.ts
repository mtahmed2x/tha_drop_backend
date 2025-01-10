import User from "@models/userModel";
import { NextFunction, Request, Response } from "express";
import to from "await-to-ts";
import { StatusCodes } from "http-status-codes";
import createError from "http-errors";
import TimeUtils from "@utils/tileUtils";
import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const linkStripeAccount = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  const userId = req.user.userId;
  let error, user;
  [error, user] = await to(User.findById(userId));
  if (error) return next(error);
  if (!user) return next(createError(StatusCodes.NOT_FOUND, "User not found"));

  const accountLink = await stripe.accountLinks.create({
    account: user.stripeAccountId,
    refresh_url: "https://example.com/cancel",
    return_url: `https://example.com/success?accountId=${user.stripeAccountId}`,
    type: "account_onboarding",
  });

  res.status(StatusCodes.OK).json({ success: true, message: "Success", data: { accountLink: accountLink.url } });
};

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
  const [error, user] = await to(User.findById(userId));
  if (error) return next(error);
  if (!user) return next(createError(StatusCodes.NOT_FOUND, "User not found"));

  return res.status(StatusCodes.OK).json({ success: true, message: "Success", data: user.schedule });
};

const updateSchedule = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  const userId = req.user.userId;
  const schedules = req.body.schedules;

  let error, user;
  [error, user] = await to(User.findById(userId));
  if (error) return next(error);
  if (!user) return next(createError(StatusCodes.NOT_FOUND, "Account not found"));

  user.schedule = schedules;
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
  linkStripeAccount,
  updateSchedule,
  getMyTickets,
  getMyGuests,
  getMySchedules,
  getMyReviews,
};

export default UserServices;
