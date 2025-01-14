import to from "await-to-ts";
import e, { Request, Response, NextFunction } from "express";
import Event from "@models/eventModel";
import { StatusCodes } from "http-status-codes";
import User from "@models/userModel";

const home = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  let error, events, users;
  [error, events] = await to(Event.find().sort({ ticketSell: -1 }).limit(15).lean());
  if (error) return next(error);
  let top5, top10;
  if (events.length === 15) {
    top5 = events.slice(0, 5);
    top10 = events.slice(5, 10);
  }
  if (events.length > 5 && events.length < 15) {
    top5 = events.slice(0, 5);
    top10 = events.filter((_, index) => index >= 5);
  }
  if (events.length <= 5) {
    top5 = events;
    top10 = [];
  }

  [error, users] = await to(User.find().sort({ averageRating: -1 }).limit(15).lean());
  if (error) return next(error);

  if (users.length === 0)
    return res.status(StatusCodes.OK).json({ success: true, message: "Success", data: { top5, top10, users: [] } });
  return res.status(StatusCodes.OK).json({ success: true, message: "Success", data: { top5, top10, users } });
};

const HommeController = {
  home,
};

export default HommeController;
