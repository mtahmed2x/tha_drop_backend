"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const reviewModel_1 = __importDefault(require("../models/reviewModel"));
const await_to_ts_1 = __importDefault(require("await-to-ts"));
const getAverageRating = async (targetId) => {
    const [error, result] = await (0, await_to_ts_1.default)(reviewModel_1.default.aggregate([
        {
            $match: { target: targetId },
        },
        {
            $group: {
                _id: "$target",
                averageRating: { $avg: "$rating" },
            },
        },
    ]));
    if (error)
        throw error;
    if (result.length === 0) {
        return 0;
    }
    return result[0].averageRating;
};
const ReviewServices = {
    getAverageRating,
};
exports.default = ReviewServices;
