import User from "@models/userModel";
import Auth from "@models/authModel";
import { NextFunction, Request, Response } from "express";
import to from "await-to-ts";
import { StatusCodes } from "http-status-codes";
import createError from "http-errors";
import { UserSchema } from "@schemas/userSchema";
import { Role } from "@shared/enum";
import TimeUtils from "@utils/tileUtils";
import Cloudinary from "@shared/cloudinary";

const get = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  const userid = req.user.userId;
  const [error, user] = await to(
    User.findById(userid).populate({ path: "auth", select: "email role isApproved isBlocked" }).lean()
  );
  if (!user!.dateOfBirth) user!.dateOfBirth = null;
  if (!user!.address) user!.address = null;
  if (!user!.gender) user!.gender = null;
  if (!user!.ratePerHour) user!.ratePerHour = null;

  if (error) return next(error);
  return res.status(StatusCodes.OK).json({ success: true, message: "Success", data: user });
};

const getAllUsers = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  const role = req.query.role as Role;
  const isApproved = req.query.isApproved === "true";
  console.log(role);
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

  const {
    name,
    phoneNumber,
    ratePerHour,
    address,
    dateOfBirth,
    gender,
    isResturentOwner,
    resturentName,
    avatarUrl,
    licenseUrl,
  } = req.body;

  let error, user;
  [error, user] = await to(User.findById(userId).populate({ path: "auth", select: "email role isApproved isBlocked" }));
  if (error) return next(error);
  if (!user) return next(createError(StatusCodes.NOT_FOUND, "User Not Found"));

  if (avatarUrl) {
    await Cloudinary.remove(user.avatar);
    user.avatar = avatarUrl;
  }

  if (licenseUrl) {
    await Cloudinary.remove(user.licensePhoto);
    user.licensePhoto = licenseUrl;
  }

  user.name = name || user.name;
  user.phoneNumber = phoneNumber || user.phoneNumber;
  user.address = address || user.address;
  user.dateOfBirth = dateOfBirth || user.dateOfBirth;
  user.gender = gender || user.gender;
  user.ratePerHour = Number.parseFloat(ratePerHour) || user.ratePerHour;

  if (isResturentOwner !== undefined) {
    user.isResturentOwner = isResturentOwner;
    user.resturentName = resturentName || user.resturentName;
  }

  [error] = await to(user.save());
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
  getAllUsers,
  update,
  approve,
  block,
  unblock,
};
export default UserController;
