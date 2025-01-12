import { Request, Response, NextFunction } from "express";
import User from "@models/userModel";
import { Types } from "mongoose";
import createError from "http-errors";
import { StatusCodes } from "http-status-codes";
import { RequestStatus, RequestType } from "@shared/enum";

type payload = {
  date: Date;
  schedule: {
    startAt: string;
    endAt: string;
  };
  map: {
    location: string;
    latitude: number;
    longitude: number;
  };
  users: Types.ObjectId[];
};

const hire = async (req: Request<{}, {}, payload>, res: Response, next: NextFunction): Promise<any> => {
  const userId = req.user.userId;
  const { date, schedule, map, users } = req.body;

  if (!Array.isArray(users) || users.length === 0) {
    return next(createError(StatusCodes.BAD_REQUEST, "Users array is required and cannot be empty"));
  }

  try {
    const user = await User.findById(userId);
    if (!user) return next(createError(StatusCodes.NOT_FOUND, "User not found"));

    const targetUsers = await User.find({ _id: { $in: users } });
    if (targetUsers.length !== users.length) {
      return next(createError(StatusCodes.NOT_FOUND, "One or more users not found"));
    }

    for (const targetUser of targetUsers) {
      user.requests = user.requests || [];
      const sentRequest = {
        types: RequestType.SENT,
        status: RequestStatus.PENDING,
        date,
        schedule,
        map,
        user: targetUser._id as Types.ObjectId,
        name: targetUser.name,
        avatar: targetUser.avatar,
        rating: targetUser.averageRating,
      };
      user.requests.push(sentRequest);

      targetUser.requests = targetUser.requests || [];
      const receivedRequest = {
        types: RequestType.RECIEVED,
        status: RequestStatus.PENDING,
        date,
        schedule,
        map,
        user: user._id as Types.ObjectId,
        name: user.name,
        avatar: user.avatar,
        rating: user.averageRating,
      };
      targetUser.requests.push(receivedRequest);
    }

    await user.save();
    await Promise.all(targetUsers.map((targetUser) => targetUser.save()));

    res.status(StatusCodes.OK).json({ success: true, message: "Requests sent successfully" });
  } catch (error) {
    next(error);
  }
};
