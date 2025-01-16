"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const userModel_1 = __importDefault(require("../models/userModel"));
const await_to_ts_1 = __importDefault(require("await-to-ts"));
const http_status_codes_1 = require("http-status-codes");
const http_errors_1 = __importDefault(require("http-errors"));
const tileUtils_1 = __importDefault(require("../utils/tileUtils"));
const stripe_1 = __importDefault(require("stripe"));
const enum_1 = require("../shared/enum");
const stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY);
const getMyTickets = async (req, res, next) => {
    const userId = req.user.userId;
    const [error, user] = await (0, await_to_ts_1.default)(userModel_1.default.findById(userId));
    if (error)
        return next(error);
    if (!user)
        return next((0, http_errors_1.default)(http_status_codes_1.StatusCodes.NOT_FOUND, "User not found"));
    return res.status(http_status_codes_1.StatusCodes.OK).json({ success: true, message: "Success", data: user.tickets });
};
const getMyGuests = async (req, res, next) => {
    const userId = req.user.userId;
    const [error, user] = await (0, await_to_ts_1.default)(userModel_1.default.findById(userId));
    if (error)
        return next(error);
    if (!user)
        return next((0, http_errors_1.default)(http_status_codes_1.StatusCodes.NOT_FOUND, "User not found"));
    return res.status(http_status_codes_1.StatusCodes.OK).json({ success: true, message: "Success", data: user.guests });
};
const getMySchedules = async (req, res, next) => {
    const userId = req.user.userId;
    const [error, user] = await (0, await_to_ts_1.default)(userModel_1.default.findById(userId).lean());
    if (error)
        return next(error);
    if (!user)
        return next((0, http_errors_1.default)(http_status_codes_1.StatusCodes.NOT_FOUND, "User not found"));
    const schedules = user.schedule?.map((schedule) => {
        const startAtConverted = schedule.startAt !== null ? tileUtils_1.default.parseMinutesToTime(schedule.startAt) : null;
        const endAtConverted = schedule.endAt !== null ? tileUtils_1.default.parseMinutesToTime(schedule.endAt) : null;
        return {
            ...schedule,
            startAt: startAtConverted,
            endAt: endAtConverted,
        };
    });
    return res.status(http_status_codes_1.StatusCodes.OK).json({ success: true, message: "Success", data: schedules });
};
const getMyRequests = async (req, res, next) => {
    const userId = req.user.userId;
    try {
        const user = await userModel_1.default.findById(userId).lean();
        if (!user)
            return next((0, http_errors_1.default)(http_status_codes_1.StatusCodes.NOT_FOUND, "User not found"));
        const sentRequests = user.requests?.filter((request) => request.types === enum_1.RequestType.SENT) || [];
        const receivedRequests = user.requests?.filter((request) => request.types === enum_1.RequestType.RECIEVED) || [];
        return res.status(http_status_codes_1.StatusCodes.OK).json({
            success: true,
            message: "Success",
            data: { sentRequests, receivedRequests },
        });
    }
    catch (error) {
        return next(error);
    }
};
const updateSchedule = async (req, res, next) => {
    const userId = req.user.userId;
    const schedules = req.body.schedules;
    let error, user;
    [error, user] = await (0, await_to_ts_1.default)(userModel_1.default.findById(userId));
    if (error)
        return next(error);
    if (!user)
        return next((0, http_errors_1.default)(http_status_codes_1.StatusCodes.NOT_FOUND, "Account not found"));
    schedules.forEach((schedule) => {
        const day = schedule.day;
        const isActive = schedule.isActive;
        const startAt = schedule.startAt ? tileUtils_1.default.parseTimeToMinutes(schedule.startAt) : null;
        const endAt = schedule.startAt ? tileUtils_1.default.parseTimeToMinutes(schedule.endAt) : null;
        user.schedule?.push({ day, isActive, startAt, endAt });
    });
    [error] = await (0, await_to_ts_1.default)(user.save());
    if (error)
        return next(error);
    res.status(http_status_codes_1.StatusCodes.OK).json({ success: true, message: "Success", data: user });
};
const getMyReviews = async (req, res, next) => {
    const userId = req.body.userId || req.user.userId;
    const [error, user] = await (0, await_to_ts_1.default)(userModel_1.default.findById(userId));
    if (error)
        return next(error);
    if (!user)
        return next((0, http_errors_1.default)(http_status_codes_1.StatusCodes.NOT_FOUND, "Account not found"));
    if (user.reviews?.length === 0) {
        return res
            .status(http_status_codes_1.StatusCodes.OK)
            .json({ success: true, message: "Success", data: { totalReviews: 0, avgRating: 0 } });
    }
    const totalReviews = user.reviews.length;
    const avgRating = user.reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews;
    return res
        .status(http_status_codes_1.StatusCodes.OK)
        .json({ success: true, message: "Success", data: { totalReviews, avgRating, reviews: user.reviews } });
};
const UserServices = {
    updateSchedule,
    getMyRequests,
    getMyTickets,
    getMyGuests,
    getMySchedules,
    getMyReviews,
};
exports.default = UserServices;
