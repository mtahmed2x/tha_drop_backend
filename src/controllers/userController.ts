import User from "@models/userModel";
import Auth from "@models/authModel";
import { NextFunction, Request, Response } from "express";
import to from "await-to-ts";
import { StatusCodes } from "http-status-codes";
import createError from "http-errors";
import { UserSchema } from "@schemas/userSchema";

const get = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const user = req.user;
    const [error, result] = await to(
        User.findById(user.userId).populate({ path: "auth", select: "email isVerified isBlocked isApproved" })
    );
    if (error) return next(error);
    if (!result) return next(createError(StatusCodes.NOT_FOUND, "User Not Found"));
    return res.status(StatusCodes.OK).json({ uccess: true, message: "Success", data: user });
};

const getAll = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const [error, users] = await to(
        User.find().populate({
            path: "auth",
            select: "email isVerified isBlocked isApproved",
        })
    );
    if (error) return next(error);
    if (!users) return res.status(StatusCodes.OK).json({ success: true, message: "Success", data: "No User Found" });
    return res.status(StatusCodes.OK).json({ uccess: true, message: "Success", data: users });
};

const update = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    type AvatarFiles = Express.Request & {
        files: { [fieldname: string]: Express.Multer.File[] };
    };
    const user = req.user;
    let error, existingUser, newUser;
    const { name, phoneNumber, address, license, dateOfBirth, gender } = req.body;
    let avatar;
    if ((req as AvatarFiles).files) {
        avatar = (req as AvatarFiles).files.avatar;
    }

    [error, existingUser] = await to(User.findById(user.userId));
    if (error) return next(error);
    if (!existingUser) return next(createError(StatusCodes.NOT_FOUND, "User Not Found"));

    const updateFields: Partial<UserSchema> = {};
    if (name) updateFields.name = name;
    if (dateOfBirth) updateFields.dateOfBirth = dateOfBirth;
    if (gender) updateFields.gender = gender;
    if (phoneNumber) updateFields.phoneNumber = phoneNumber;
    if (address) updateFields.address = address;
    if (license) updateFields.license = license;
    if (avatar) updateFields.avatar = avatar[0].path;

    if (Object.keys(updateFields).length === 0)
        return res.status(StatusCodes.BAD_REQUEST).json({ error: "Nothing to Update" });

    [error, newUser] = await to(User.findByIdAndUpdate(user.userId, { $set: updateFields }, { new: true }));
    if (error) return next(error);
    return res.status(StatusCodes.OK).json({ uccess: true, message: "Success", data: newUser });
};

const block = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    let error, user;
    const id = req.params.id;
    [error, user] = await to(User.findById(id));
    if (error) next(error);
    if (!user) next(createError(StatusCodes.NOT_FOUND, "User Not Found"));
    [error] = await to(Auth.findByIdAndUpdate(user!.auth, { $set: { isBlocked: true } }));
    if (error) next(error);
    return res.status(200).json({ message: "User successfully blocked" });
};

const UserController = {
    get,
    getAll,
    update,
    block,
};
export default UserController;
