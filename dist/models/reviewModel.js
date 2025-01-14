"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const reviewSchema = new mongoose_1.Schema({
    user: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: true,
        ref: "User",
    },
    target: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: true,
        ref: "User",
    },
    rating: {
        type: Number,
        required: true,
        min: [1, "Star rating must be at least 1"],
        max: [5, "Star rating must not exceed 5"],
    },
    comment: {
        type: String,
    },
});
const Review = (0, mongoose_1.model)("Review", reviewSchema);
exports.default = Review;
