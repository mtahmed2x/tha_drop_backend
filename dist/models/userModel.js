"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const enum_1 = require("../shared/enum");
const userSchema = new mongoose_1.Schema({
    auth: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Auth",
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    phoneNumber: {
        type: String,
        required: true,
    },
    address: {
        type: String,
    },
    dateOfBirth: {
        type: String,
    },
    gender: {
        type: String,
        enum: enum_1.Gender,
    },
    avatar: {
        type: String,
    },
    licensePhoto: {
        type: String,
        required: true,
    },
    isResturentOwner: {
        type: Boolean,
        default: false,
    },
    resturentName: {
        type: String,
    },
    ratePerHour: {
        type: Number,
        default: null,
    },
    averageRating: {
        type: Number,
        default: 0,
    },
    totalReviews: {
        type: Number,
        default: 0,
    },
    schedule: {
        type: [
            {
                day: {
                    type: String,
                    required: true,
                },
                isActive: {
                    type: Boolean,
                    required: true,
                },
                startAt: {
                    type: Number,
                },
                endAt: {
                    type: Number,
                },
            },
        ],
        required: false,
    },
    reviews: {
        type: [
            {
                user: {
                    type: mongoose_1.Schema.Types.ObjectId,
                    ref: "User",
                    required: true,
                },
                name: {
                    type: String,
                    required: true,
                },
                avatar: {
                    type: String,
                },
                rating: {
                    type: Number,
                    required: true,
                    min: [1, "Rating must be at least 1"],
                    max: [5, "Rating must not exceed 5"],
                },
                comment: {
                    type: String,
                },
                createdAt: {
                    type: Date,
                    required: true,
                },
                updatedAt: {
                    type: Date,
                    required: true,
                },
            },
        ],
    },
    stripeAccountId: {
        type: String,
    },
    stripeAccoutStatus: {
        type: Boolean,
    },
    tickets: {
        type: [
            {
                event: {
                    type: mongoose_1.Schema.Types.ObjectId,
                    ref: "Event",
                    required: true,
                },
                title: {
                    type: String,
                    required: true,
                },
                description: {
                    type: String,
                    required: true,
                },
                cover: {
                    type: String,
                    required: true,
                },
                map: {
                    location: {
                        type: String,
                        required: true,
                    },
                    latitude: {
                        type: Number,
                        required: true,
                    },
                    longitude: {
                        type: Number,
                        required: true,
                    },
                },
                date: {
                    type: Date,
                    required: true,
                },
                quantity: {
                    type: Number,
                    required: true,
                },
                customId: {
                    type: String,
                    required: true,
                },
            },
        ],
        required: false,
    },
    guests: {
        type: [
            {
                user: {
                    type: mongoose_1.Schema.Types.ObjectId,
                    ref: "User",
                    required: true,
                },
                event: {
                    type: mongoose_1.Schema.Types.ObjectId,
                    ref: "Event",
                    required: true,
                },
                name: {
                    type: String,
                    required: true,
                },
                avatar: {
                    type: String,
                },
                quantity: {
                    type: Number,
                    required: true,
                },
                eventTitle: {
                    type: String,
                    required: true,
                },
                eventDate: {
                    type: Date,
                    required: true,
                },
            },
        ],
    },
    requests: {
        type: [
            {
                id: {
                    type: String,
                    required: true,
                },
                types: {
                    type: String,
                    required: true,
                    enum: enum_1.RequestType,
                },
                status: {
                    type: String,
                    required: true,
                    enum: enum_1.RequestStatus,
                },
                date: {
                    type: Date,
                    required: true,
                },
                schedule: {
                    startAt: {
                        type: String,
                    },
                    endAt: {
                        type: String,
                    },
                },
                map: {
                    location: {
                        type: String,
                    },
                    latitude: {
                        type: Number,
                        required: true,
                    },
                    longitude: {
                        type: Number,
                        required: true,
                    },
                },
                user: {
                    type: mongoose_1.Schema.Types.ObjectId,
                    ref: "User",
                    required: true,
                },
                name: {
                    type: String,
                    required: true,
                },
                avatar: {
                    type: String,
                },
                rating: {
                    type: Number,
                    required: true,
                    min: [0, "Rating must be at least 0"],
                    max: [5, "Rating must not exceed 5"],
                },
                cost: {
                    type: Number,
                },
            },
        ],
    },
    notifications: {
        type: [
            {
                types: {
                    type: String,
                    required: true,
                    enum: enum_1.NotificationType,
                },
                metadata: {
                    eventTitle: {
                        type: String,
                        required: true,
                    },
                    eventId: {
                        type: mongoose_1.Schema.Types.ObjectId,
                        ref: "Event",
                        required: true,
                    },
                },
            },
        ],
    },
});
const User = (0, mongoose_1.model)("User", userSchema);
exports.default = User;
