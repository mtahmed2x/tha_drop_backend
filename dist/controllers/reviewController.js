"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const await_to_ts_1 = __importDefault(require("await-to-ts"));
const http_errors_1 = __importDefault(require("http-errors"));
const http_status_codes_1 = require("http-status-codes");
const userModel_1 = __importDefault(require("../models/userModel"));
const create = async (req, res, next) => {
    const { targetId, rating, comment } = req.body;
    const userId = req.user.userId;
    let error, user, targetUser;
    [error, user] = await (0, await_to_ts_1.default)(userModel_1.default.findById(userId));
    if (error)
        return next(error);
    if (!user)
        return next((0, http_errors_1.default)(http_status_codes_1.StatusCodes.NOT_FOUND, "Account not found"));
    [error, targetUser] = await (0, await_to_ts_1.default)(userModel_1.default.findById(targetId));
    if (error)
        return next(error);
    if (!targetUser)
        return next((0, http_errors_1.default)(http_status_codes_1.StatusCodes.NOT_FOUND, "Account not found"));
    const review = {
        user: user._id,
        name: user.name,
        avatar: user.avatar ?? null,
        rating: Number.parseInt(rating),
        comment: comment,
        createdAt: new Date(),
        updatedAt: new Date(),
    };
    targetUser.reviews = targetUser.reviews || [];
    targetUser.reviews.push(review);
    const totalReviews = targetUser.reviews.length;
    const avgRating = targetUser.reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews;
    targetUser.averageRating = avgRating;
    targetUser.totalReviews = totalReviews;
    [error] = await (0, await_to_ts_1.default)(targetUser.save());
    if (error)
        return next(error);
    return res.status(http_status_codes_1.StatusCodes.CREATED).json({ success: true, message: "Success", data: review });
};
const update = async (req, res, next) => {
    const { targetId, rating, comment } = req.body;
    const userId = req.user.userId;
    if (rating && (rating < 1 || rating > 5)) {
        return next((0, http_errors_1.default)(http_status_codes_1.StatusCodes.BAD_REQUEST, "Rating must be between 1 and 5"));
    }
    let error, user, targetUser;
    [error, user] = await (0, await_to_ts_1.default)(userModel_1.default.findById(userId));
    if (error)
        return next(error);
    if (!user)
        return next((0, http_errors_1.default)(http_status_codes_1.StatusCodes.NOT_FOUND, "Account not found"));
    [error, targetUser] = await (0, await_to_ts_1.default)(userModel_1.default.findById(targetId));
    if (error)
        return next(error);
    if (!targetUser)
        return next((0, http_errors_1.default)(http_status_codes_1.StatusCodes.NOT_FOUND, "Account not found"));
    const reviewIndex = targetUser.reviews?.findIndex((review) => review.user.toString() === user._id.toString());
    if (reviewIndex === undefined || reviewIndex < 0 || targetUser.reviews?.length === 0) {
        return next((0, http_errors_1.default)(http_status_codes_1.StatusCodes.NOT_FOUND, "Review not found"));
    }
    targetUser.reviews[reviewIndex].rating = rating || targetUser.reviews[reviewIndex].rating;
    targetUser.reviews[reviewIndex].comment = comment || targetUser.reviews[reviewIndex].comment;
    targetUser.reviews[reviewIndex].updatedAt = new Date();
    if (rating) {
        const totalReviews = targetUser.reviews.length;
        const avgRating = targetUser.reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews;
        targetUser.averageRating = avgRating;
    }
    [error] = await (0, await_to_ts_1.default)(targetUser.save());
    if (error)
        return next(error);
    return res.status(http_status_codes_1.StatusCodes.OK).json({
        success: true,
        message: "Success",
        data: targetUser.reviews[reviewIndex],
    });
};
const ReviewController = {
    create,
    update,
};
exports.default = ReviewController;
