"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const stripe_1 = __importDefault(require("stripe"));
const eventModel_1 = __importDefault(require("../models/eventModel"));
require("dotenv/config");
const await_to_ts_1 = __importDefault(require("await-to-ts"));
const http_errors_1 = __importDefault(require("http-errors"));
const http_status_codes_1 = require("http-status-codes");
const userModel_1 = __importDefault(require("../models/userModel"));
const stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY);
const buyTicket = async (req, res, next) => {
    const userId = req.user.userId;
    const quantity = req.body.quantity;
    const eventId = req.body.eventId;
    console.log(eventId);
    let error, user, event, eventHost, session;
    [error, user] = await (0, await_to_ts_1.default)(userModel_1.default.findById(userId));
    if (error)
        return next(error);
    if (!user)
        return next((0, http_errors_1.default)(http_status_codes_1.StatusCodes.NOT_FOUND, "User not found"));
    console.log(user);
    [error, event] = await (0, await_to_ts_1.default)(eventModel_1.default.findById(eventId));
    if (error)
        return next(error);
    if (!event)
        return next((0, http_errors_1.default)(http_status_codes_1.StatusCodes.NOT_FOUND, "Event not found"));
    console.log(event.host);
    [error, eventHost] = await (0, await_to_ts_1.default)(userModel_1.default.findById(event.host));
    if (error)
        return next(error);
    if (!eventHost)
        return next((0, http_errors_1.default)(http_status_codes_1.StatusCodes.NOT_FOUND, "Event host not found"));
    [error, session] = await (0, await_to_ts_1.default)(stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
            {
                price: event.ticketPriceId,
                quantity: Number.parseInt(quantity),
            },
        ],
        mode: "payment",
        payment_intent_data: {
            transfer_data: {
                destination: eventHost.stripeAccountId,
            },
            metadata: {
                quantity: Number.parseInt(quantity),
                userId: userId,
                eventId: eventId,
            },
        },
        success_url: `https://example.com/success`,
        cancel_url: `https://example.com/cancel`,
    }));
    if (error)
        return next(error);
    return res.status(http_status_codes_1.StatusCodes.OK).json({ success: true, message: "Success", data: session });
};
const EventServices = {
    buyTicket,
};
exports.default = EventServices;
