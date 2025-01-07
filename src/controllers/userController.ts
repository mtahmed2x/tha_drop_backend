import User from "@models/userModel";
import Auth from "@models/authModel";
import { NextFunction, Request, Response } from "express";
import to from "await-to-ts";
import { StatusCodes } from "http-status-codes";
import createError from "http-errors";
import { UserSchema } from "@schemas/userSchema";
import { Role } from "@shared/enum";
import TimeUtils from "@utils/tileUtils";
import { equal } from "assert";

const get = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  const userid = req.user.userId;
  const [error, user] = await to(
    User.findById(userid).populate({ path: "auth", select: "email role isApproved isBlocked avatar" }).lean()
  );
  if (error) return next(error);
  return res.status(StatusCodes.OK).json({ success: true, message: "Success", data: user });
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

const getAllUsers = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  const role = req.query.role as Role;
  const isApproved = req.query.isApproved === "true";
  const dateString = req.query.date as string;
  const searchQuery = req.query.search as string;

  let startAt, endAt;
  if (req.query.startAt && req.query.endAt) {
    startAt = TimeUtils.parseTimeToMinutes(req.query.startAt as string);
    endAt = TimeUtils.parseTimeToMinutes(req.query.endAt as string);
  }

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

  const searchFilter = searchQuery
    ? {
        $or: [
          { name: { $regex: searchQuery, $options: "i" } },
          { "auth.email": { $regex: searchQuery, $options: "i" } },
        ],
      }
    : {};

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
          ...searchFilter,
          ...scheduleFilter,
        },
      },
      {
        $addFields: {
          avatar: { $ifNull: ["$avatar", "assets/avatar-default.webp"] },
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

const update = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  const userId = req.user.userId;
  console.log(req.body);

  const { name, phoneNumber, address, dateOfBirth, gender, isResturentOwner, resturentName } = req.body;
  console.log(name, phoneNumber);

  let avatar, licensePhoto;
  const files = (req as any).files || {};
  if (files.avatar) {
    avatar = files.avatar[0].path;
  }
  if (files.licensePhoto) {
    licensePhoto = files.licensePhoto[0].path;
  }
  let error, user;
  [error, user] = await to(User.findById(userId));
  if (error) return next(error);

  if (!user) return next(createError(StatusCodes.NOT_FOUND, "User Not Found"));

  const updatedFields: Partial<UserSchema> = {
    name: name || user.name,
    phoneNumber: phoneNumber || user.phoneNumber,
    address: address || user.address,
    dateOfBirth: dateOfBirth || user.dateOfBirth,
    gender: gender || user.gender,
    avatar: avatar || user.avatar,
    licensePhoto: licensePhoto || user.licensePhoto,
  };
  if (isResturentOwner !== undefined) {
    updatedFields.isResturentOwner = isResturentOwner;
    updatedFields.resturentName = resturentName || user.resturentName;
  }

  [error, user] = await to(User.findByIdAndUpdate(userId, { $set: updatedFields }, { new: true }));

  if (error) return next(error);

  return res.status(StatusCodes.OK).json({ success: true, message: "Success", data: user });
};

const approve = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  const userId = req.params.id;
  let error, auth, user;
  [error, user] = await to(User.findById(userId));
  if (error) return next(error);
  if (!user) return next(createError(StatusCodes.NOT_FOUND, "User Not Found"));

  [error, auth] = await to(Auth.findById(user.auth));
  if (error) return next(error);
  if (!auth) return next(createError(StatusCodes.NOT_FOUND, "Auth Not Found"));

  auth.isApproved = true;
  [error] = await to(auth.save());
  if (error) return next(error);

  return res.status(StatusCodes.OK).json({ success: true, message: "Success", data: {} });
};

const block = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  const userId = req.params.id;
  let error, auth, user;
  [error, user] = await to(User.findById(userId));
  if (error) return next(error);
  if (!user) return next(createError(StatusCodes.NOT_FOUND, "User Not Found"));

  [error, auth] = await to(Auth.findById(user.auth));
  if (error) return next(error);
  if (!auth) return next(createError(StatusCodes.NOT_FOUND, "Auth Not Found"));

  auth.isBlocked = true;
  [error] = await to(auth.save());
  if (error) return next(error);

  return res.status(StatusCodes.OK).json({ success: true, message: "Success", data: {} });
};

const unblock = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  const userId = req.params.id;
  let error, auth, user;

  [error, user] = await to(User.findById(userId));
  if (error) return next(error);
  if (!user) return next(createError(StatusCodes.NOT_FOUND, "User Not Found"));

  [error, auth] = await to(Auth.findById(user.auth));
  if (error) return next(error);
  if (!auth) return next(createError(StatusCodes.NOT_FOUND, "Auth Not Found"));

  auth.isBlocked = false;
  [error] = await to(auth.save());
  if (error) return next(error);

  return res.status(StatusCodes.OK).json({ success: true, message: "Success", data: {} });
};

const UserController = {
  get,
  updateSchedule,
  getAllUsers,
  update,
  approve,
  block,
  unblock,
};
export default UserController;
