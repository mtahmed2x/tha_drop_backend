"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const eventSchema = new mongoose_1.Schema({
    title: {
        type: String,
        required: true,
    },
    organizer: {
        type: String,
        required: true,
    },
    host: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    category: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Category",
        required: true,
    },
    subCategory: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "SubCategory",
        required: true,
    },
    date: {
        type: Date,
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
    gallery: [
        {
            type: String,
        },
    ],
    productId: {
        type: String,
        required: true,
    },
    ticketPrice: {
        type: Number,
        required: true,
    },
    ticketPriceId: {
        type: String,
        required: true,
    },
    deadline: {
        type: Date,
        required: true,
    },
    availableTickets: {
        type: Number,
    },
    ticketSell: {
        type: Number,
        default: 0,
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
}, { timestamps: true });
const Event = (0, mongoose_1.model)("Event", eventSchema);
exports.default = Event;
