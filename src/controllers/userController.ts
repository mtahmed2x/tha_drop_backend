import User from "@models/userModel";
import Auth from "@models/authModel";
import { NextFunction, Request, Response } from "express";
import to from "await-to-ts";
import { StatusCodes } from "http-status-codes";
import createError from "http-errors";
import { UserSchema } from "@schemas/userSchema";
import { Role } from "@shared/enum";

const get = async (
    role: Role,
    isApproved: boolean,
    page: number,
    limit: number
): Promise<{ data: any[]; total: number }> => {
    const skip = (page - 1) * limit;

    const [error, users] = await to(
        User.find()
            .populate({ path: "auth", select: "email role isVerified isApproved" })
            .where("auth.role")
            .equals(role)
            .where("auth.isVerified")
            .equals(true)
            .where("auth.isApproved")
            .equals(isApproved)
            .skip(skip)
            .limit(limit)
            .lean()
    );
    if (error) throw error;

    const [countError, total] = await to(User.countDocuments({ "auth.role": role }).exec());
    if (countError) throw countError;

    return { data: users, total };
};

const getAllByRole = async (
    role: Role,
    isApproved: boolean,
    req: Request,
    res: Response,
    next: NextFunction
): Promise<any> => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const [error, result] = await to(get(role, isApproved, page, limit));
    if (error) return next(error);

    const data = result?.data || [];
    const total = result?.total || 0;
    const totalPages = Math.ceil(total / limit);

    const message = data.length > 0 ? "Success" : `No ${role} Found`;

    return res.status(StatusCodes.OK).json({
        success: true,
        message,
        data,
        meta: {
            page,
            limit,
            total,
            totalPages,
        },
    });
};

const allGuests = (req: Request, res: Response, next: NextFunction): Promise<any> =>
    getAllByRole(Role.GUEST, true, req, res, next);

const allHostsApproved = (req: Request, res: Response, next: NextFunction): Promise<any> =>
    getAllByRole(Role.HOST, true, req, res, next);
const allHostsPending = (req: Request, res: Response, next: NextFunction): Promise<any> =>
    getAllByRole(Role.HOST, false, req, res, next);

const allDJsApproved = (req: Request, res: Response, next: NextFunction): Promise<any> =>
    getAllByRole(Role.DJ, true, req, res, next);
const allDJsPending = (req: Request, res: Response, next: NextFunction): Promise<any> =>
    getAllByRole(Role.DJ, false, req, res, next);

const allBartendersApproved = (req: Request, res: Response, next: NextFunction): Promise<any> =>
    getAllByRole(Role.BARTENDER, true, req, res, next);
const allBartendersPending = (req: Request, res: Response, next: NextFunction): Promise<any> =>
    getAllByRole(Role.BARTENDER, false, req, res, next);

const allBottlegirlsApproved = (req: Request, res: Response, next: NextFunction): Promise<any> =>
    getAllByRole(Role.BOTTLEGIRL, true, req, res, next);
const allBottlegirlsPending = (req: Request, res: Response, next: NextFunction): Promise<any> =>
    getAllByRole(Role.BOTTLEGIRL, false, req, res, next);

const update = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const userId = req.user.userId;
    const { name, phoneNumber, address, dateOfBirth, gender, isResturentOwner, resturentName } = req.body;
    let avatar, licensePhoto;
    if ((req as any).files.avatar) {
        avatar = (req as any).files.avatar[0].path;
    }
    if ((req as any).files.licensePhoto) {
        licensePhoto = (req as any).files.licensePhoto[0].path;
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
    if (user.isResturentOwner) {
        updatedFields.isResturentOwner = isResturentOwner || user.isResturentOwner;
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
    allGuests,
    allHostsApproved,
    allHostsPending,
    allDJsApproved,
    allDJsPending,
    allBartendersApproved,
    allBartendersPending,
    allBottlegirlsApproved,
    allBottlegirlsPending,
    update,
    approve,
    block,
    unblock,
};
export default UserController;
