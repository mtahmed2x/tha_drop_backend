"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const userModel_1 = __importDefault(require("../models/userModel"));
const authModel_1 = __importDefault(require("../models/authModel"));
const await_to_ts_1 = __importDefault(require("await-to-ts"));
const http_status_codes_1 = require("http-status-codes");
const http_errors_1 = __importDefault(require("http-errors"));
const tileUtils_1 = __importDefault(require("../utils/tileUtils"));
const cloudinary_1 = __importDefault(require("../shared/cloudinary"));
const get = async (req, res, next) => {
    const userid = req.user.userId;
    const [error, user] = await (0, await_to_ts_1.default)(userModel_1.default.findById(userid).populate({ path: "auth", select: "email role isApproved isBlocked" }).lean());
    if (!user.dateOfBirth)
        user.dateOfBirth = null;
    if (!user.address)
        user.address = null;
    if (!user.gender)
        user.gender = null;
    if (!user.ratePerHour)
        user.ratePerHour = null;
    if (error)
        return next(error);
    return res.status(http_status_codes_1.StatusCodes.OK).json({ success: true, message: "Success", data: user });
};
const getById = async (req, res, next) => {
    const userid = req.params.id;
    const [error, user] = await (0, await_to_ts_1.default)(userModel_1.default.findById(userid)
        .select("-schedule -tickets -requests -guests -notifications")
        .populate({ path: "auth", select: "email role isApproved isBlocked" })
        .lean());
    user.avatar = user.avatar || "";
    if (!user.dateOfBirth)
        user.dateOfBirth = null;
    if (!user.address)
        user.address = null;
    if (!user.gender)
        user.gender = null;
    if (!user.ratePerHour)
        user.ratePerHour = null;
    if (error)
        return next(error);
    return res.status(http_status_codes_1.StatusCodes.OK).json({ success: true, message: "Success", data: user });
};
const getAllUsers = async (req, res, next) => {
    const role = req.query.role;
    const isApproved = req.query.isApproved === "true";
    console.log(role);
    const dateString = req.query.date;
    const searchQuery = req.query.search;
    let startAt, endAt;
    if (req.query.startAt && req.query.endAt) {
        startAt = tileUtils_1.default.parseTimeToMinutes(req.query.startAt);
        endAt = tileUtils_1.default.parseTimeToMinutes(req.query.endAt);
    }
    let day = null;
    if (dateString) {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            return res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({ success: false, message: "Invalid date format", data: {} });
        }
        day = date.toLocaleString("en-US", { weekday: "long" });
    }
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
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
    const [error, result] = await (0, await_to_ts_1.default)(userModel_1.default.aggregate([
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
    ]));
    if (error)
        return next(error);
    const totalCount = result[0]?.totalCount[0]?.count || 0;
    const users = result[0]?.paginatedResults || [];
    return res.status(http_status_codes_1.StatusCodes.OK).json({
        success: true,
        message: "Success",
        data: users,
        page,
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
        limit,
    });
};
const update = async (req, res, next) => {
    const userId = req.user.userId;
    console.log(req.body);
    const { name, phoneNumber, ratePerHour, address, dateOfBirth, gender, isResturentOwner, resturentName, avatarUrl, licenseUrl, } = req.body;
    let error, user;
    [error, user] = await (0, await_to_ts_1.default)(userModel_1.default.findById(userId).populate({ path: "auth", select: "email role isApproved isBlocked" }));
    if (error)
        return next(error);
    if (!user)
        return next((0, http_errors_1.default)(http_status_codes_1.StatusCodes.NOT_FOUND, "User Not Found"));
    if (avatarUrl) {
        if (user.avatar)
            await cloudinary_1.default.remove(user.avatar);
        user.avatar = avatarUrl;
    }
    if (licenseUrl) {
        await cloudinary_1.default.remove(user.licensePhoto);
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
    [error] = await (0, await_to_ts_1.default)(user.save());
    if (error)
        return next(error);
    return res.status(http_status_codes_1.StatusCodes.OK).json({ success: true, message: "Success", data: user });
};
const approve = async (req, res, next) => {
    const userId = req.params.id;
    let error, auth, user;
    [error, user] = await (0, await_to_ts_1.default)(userModel_1.default.findById(userId));
    if (error)
        return next(error);
    if (!user)
        return next((0, http_errors_1.default)(http_status_codes_1.StatusCodes.NOT_FOUND, "User Not Found"));
    [error, auth] = await (0, await_to_ts_1.default)(authModel_1.default.findById(user.auth));
    if (error)
        return next(error);
    if (!auth)
        return next((0, http_errors_1.default)(http_status_codes_1.StatusCodes.NOT_FOUND, "Auth Not Found"));
    auth.isApproved = true;
    [error] = await (0, await_to_ts_1.default)(auth.save());
    if (error)
        return next(error);
    return res.status(http_status_codes_1.StatusCodes.OK).json({ success: true, message: "Success", data: {} });
};
const block = async (req, res, next) => {
    const userId = req.params.id;
    let error, auth, user;
    [error, user] = await (0, await_to_ts_1.default)(userModel_1.default.findById(userId));
    if (error)
        return next(error);
    if (!user)
        return next((0, http_errors_1.default)(http_status_codes_1.StatusCodes.NOT_FOUND, "User Not Found"));
    [error, auth] = await (0, await_to_ts_1.default)(authModel_1.default.findById(user.auth));
    if (error)
        return next(error);
    if (!auth)
        return next((0, http_errors_1.default)(http_status_codes_1.StatusCodes.NOT_FOUND, "Auth Not Found"));
    auth.isBlocked = true;
    [error] = await (0, await_to_ts_1.default)(auth.save());
    if (error)
        return next(error);
    return res.status(http_status_codes_1.StatusCodes.OK).json({ success: true, message: "Success", data: {} });
};
const unblock = async (req, res, next) => {
    const userId = req.params.id;
    let error, auth, user;
    [error, user] = await (0, await_to_ts_1.default)(userModel_1.default.findById(userId));
    if (error)
        return next(error);
    if (!user)
        return next((0, http_errors_1.default)(http_status_codes_1.StatusCodes.NOT_FOUND, "User Not Found"));
    [error, auth] = await (0, await_to_ts_1.default)(authModel_1.default.findById(user.auth));
    if (error)
        return next(error);
    if (!auth)
        return next((0, http_errors_1.default)(http_status_codes_1.StatusCodes.NOT_FOUND, "Auth Not Found"));
    auth.isBlocked = false;
    [error] = await (0, await_to_ts_1.default)(auth.save());
    if (error)
        return next(error);
    return res.status(http_status_codes_1.StatusCodes.OK).json({ success: true, message: "Success", data: {} });
};
const UserController = {
    get,
    getById,
    getAllUsers,
    update,
    approve,
    block,
    unblock,
};
exports.default = UserController;
