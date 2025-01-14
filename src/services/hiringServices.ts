import { Request, Response, NextFunction } from "express";
import User from "@models/userModel";
import { Types } from "mongoose";
import createError from "http-errors";
import { StatusCodes } from "http-status-codes";
import { RequestStatus, RequestType, Role } from "@shared/enum";
import to from "await-to-ts";
import TimeUtils from "@utils/tileUtils";
import { v4 as uuidv4 } from "uuid";

const getAvailableHire = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  const role = req.query.role as Role;
  const dateString = req.query.date as string;
  const startAt = TimeUtils.parseTimeToMinutes(req.query.startAt as string);
  const endAt = TimeUtils.parseTimeToMinutes(req.query.endAt as string);

  const isApproved = "true";

  let day: string | null = null;
  if (dateString) {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: "Invalid date format", data: {} });
    }
    day = date.toLocaleString("en-US", { weekday: "long" });
  }

  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;

  const scheduleFilter = day
    ? {
        schedule: {
          $elemMatch: {
            day: day,
            isActive: true,
            startAt: { $lte: startAt },
            endAt: { $gte: endAt },
          },
        },
      }
    : {};

  const [error, result] = await to(
    User.aggregate([
      {
        $lookup: {
          from: "auths",
          localField: "auth",
          foreignField: "_id",
          as: "auth",
        },
      },
      {
        $unwind: {
          path: "$auth",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $match: {
          "auth.role": role,
          "auth.isApproved": isApproved,
          ...scheduleFilter,
        },
      },
      {
        $addFields: {
          avatar: { $ifNull: ["$avatar", null] },
          dateOfBirth: { $ifNull: ["$dateOfBirth", null] },
        },
      },
      {
        $facet: {
          totalCount: [{ $count: "count" }],
          paginatedResults: [
            { $skip: (page - 1) * limit },
            { $limit: limit },
            {
              $project: {
                name: 1,
                address: 1,
                dateOfBirth: 1,
                avatar: 1,
                schedule: 1,
                "auth._id": 1,
                "auth.isApproved": 1,
                "auth.isBlocked": 1,
                "auth.email": 1,
                phoneNumber: 1,
                licensePhoto: 1,
                isResturentOwner: 1,
                resturentName: 1,
                "auth.role": 1,
              },
            },
          ],
        },
      },
    ])
  );

  if (error) return next(error);

  const totalCount = result[0]?.totalCount[0]?.count || 0;
  const users = result[0]?.paginatedResults || [];

  return res.status(StatusCodes.OK).json({
    success: true,
    message: "Success",
    data: users,
    page,
    totalPages: Math.ceil(totalCount / limit),
    totalCount,
    limit,
  });
};

type payload = {
  date: Date;
  schedule: {
    startAt: string;
    endAt: string;
  };
  map: {
    location: string;
    latitude: string;
    longitude: string;
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

    const m = {
      location: map.location,
      latitude: Number.parseFloat(map.latitude),
      longitude: Number.parseFloat(map.longitude),
    };

    for (const targetUser of targetUsers) {
      user.requests = user.requests || [];
      const id = uuidv4();
      const sentRequest = {
        id: id,
        types: RequestType.SENT,
        status: RequestStatus.PENDING,
        date,
        schedule,
        map: m,
        user: targetUser._id as Types.ObjectId,
        name: targetUser.name,
        avatar: targetUser.avatar ?? null,
        rating: targetUser.averageRating ?? 0,
      };
      user.requests.push(sentRequest);

      targetUser.requests = targetUser.requests || [];
      const receivedRequest = {
        id: id,
        types: RequestType.RECIEVED,
        status: RequestStatus.PENDING,
        date,
        schedule,
        map: m,
        user: user._id as Types.ObjectId,
        name: user.name,
        avatar: user.avatar ?? null,
        rating: user.averageRating ?? 0,
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

const acceptRequest = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  const userId = req.user.userId;
  const requestId = req.body.requestId;
  let error, user;
  [error, user] = await to(User.findById(userId));
  if (error) return next(error);
  if (!user) return next(createError(StatusCodes.NOT_FOUND, "User not found"));
  if (user.requests) {
    console.log(user.requests);
    console.log(requestId);
    const request = user.requests.find((r) => r.id === requestId);
    if (request) {
      if (request.types === RequestType.RECIEVED) {
        request.status = RequestStatus.ACCEPTED;
        await user.save();
        res.status(StatusCodes.OK).json({ success: true, message: "Request accepted successfully", data: {} });
      } else {
        return next(createError(StatusCodes.BAD_REQUEST, "Invalid request type"));
      }
    } else {
      return next(createError(StatusCodes.NOT_FOUND, "Request not found"));
    }
  }
  return next(createError(StatusCodes.NOT_FOUND, "No requests found"));
};

const rejectRequest = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  const userId = req.user.userId;
  const requestId = req.params.requestId;
  let error, user;
  [error, user] = await to(User.findById(userId));
  if (error) return next(error);
  if (!user) return next(createError(StatusCodes.NOT_FOUND, "User not found"));

  if (user.requests) {
    const request = user.requests.find((r) => r.id === requestId);
    if (request) {
      if (request.types === RequestType.RECIEVED) {
        request.status = RequestStatus.REJECTED;
        await user.save();
        res.status(StatusCodes.OK).json({ success: true, message: "Request rejected successfully", data: {} });
      } else {
        return next(createError(StatusCodes.BAD_REQUEST, "Invalid request type"));
      }
    } else {
      return next(createError(StatusCodes.NOT_FOUND, "Request not found"));
    }
  }
  return next(createError(StatusCodes.NOT_FOUND, "No requests found"));
};

const HiringService = {
  getAvailableHire,
  hire,
  acceptRequest,
  rejectRequest,
};

export default HiringService;
