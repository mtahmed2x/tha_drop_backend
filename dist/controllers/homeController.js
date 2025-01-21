"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const await_to_ts_1 = __importDefault(require("await-to-ts"));
const eventModel_1 = __importDefault(require("../models/eventModel"));
const http_errors_1 = __importDefault(require("http-errors"));
const http_status_codes_1 = require("http-status-codes");
const userModel_1 = __importDefault(require("../models/userModel"));
const home = async (req, res, next) => {
    const userId = req.user.userId;
    let error, topEvents, latestEvents, users, user;
    [error, topEvents] = await (0, await_to_ts_1.default)(eventModel_1.default.find().sort({ ticketSell: -1 }).select("title cover map _id").limit(15).lean());
    if (error)
        return next(error);
    let top5, top10;
    if (topEvents.length === 15) {
        top5 = topEvents.slice(0, 5);
        top10 = topEvents.slice(5, 10);
    }
    if (topEvents.length > 5 && topEvents.length < 15) {
        top5 = topEvents.slice(0, 5);
        top10 = topEvents.filter((_, index) => index >= 5);
    }
    if (topEvents.length <= 5) {
        top5 = topEvents;
        top10 = [];
    }
    [error, latestEvents] = await (0, await_to_ts_1.default)(eventModel_1.default.find().sort({ createdAt: -1 }).select("title cover map _id").limit(15).lean());
    if (error)
        return next(error);
    let totalReviews, avgRating;
    [error, user] = await (0, await_to_ts_1.default)(userModel_1.default.findById(userId));
    if (error)
        return next(error);
    if (!user)
        return next((0, http_errors_1.default)(http_status_codes_1.StatusCodes.NOT_FOUND, "User Not found"));
    if (user.reviews?.length === 0) {
        totalReviews = 0;
        avgRating = 0;
    }
    totalReviews = user.reviews.length;
    avgRating = user.reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews;
    [error, users] = await (0, await_to_ts_1.default)(userModel_1.default.find().sort({ averageRating: -1 }).select("name avatar _id").limit(15).lean());
    users.forEach((user) => {
        user.avatar = user.avatar ? user.avatar : "";
    });
    if (error)
        return next(error);
    if (users.length === 0)
        return res.status(http_status_codes_1.StatusCodes.OK).json({
            success: true,
            message: "Success",
            data: { top5, top10, latestEvents, users: [], review: { totalReviews, avgRating } },
        });
    return res.status(http_status_codes_1.StatusCodes.OK).json({
        success: true,
        message: "Success",
        data: { top5, top10, latestEvents, users, review: { totalReviews, avgRating } },
    });
};
const HommeController = {
    home,
};
exports.default = HommeController;
