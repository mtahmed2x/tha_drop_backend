"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const userModel_1 = __importDefault(require("../models/userModel"));
const eventModel_1 = __importDefault(require("../models/eventModel"));
const await_to_ts_1 = __importDefault(require("await-to-ts"));
const stripe_1 = __importDefault(require("stripe"));
const http_errors_1 = __importDefault(require("http-errors"));
const http_status_codes_1 = require("http-status-codes");
const mongoose_1 = require("mongoose");
const uuid_1 = require("uuid");
const stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY);
const linkStripeAccount = async (req, res, next) => {
    const userId = req.user.userId;
    let error, user, account;
    [error, user] = await (0, await_to_ts_1.default)(userModel_1.default.findById(userId));
    if (error)
        return next(error);
    if (!user)
        return next((0, http_errors_1.default)(http_status_codes_1.StatusCodes.NOT_FOUND, "User not found"));
    [error, account] = await (0, await_to_ts_1.default)(stripe.accounts.create({ type: "express" }));
    if (error)
        return next(error);
    user.stripeAccountId = account.id;
    user.stripeAccoutStatus = false;
    [error] = await (0, await_to_ts_1.default)(user.save());
    if (error)
        return next(error);
    const accountLink = await stripe.accountLinks.create({
        account: user.stripeAccountId,
        refresh_url: "https://example.com/cancel",
        return_url: `https://example.com/success?accountId=${user.stripeAccountId}`,
        type: "account_onboarding",
    });
    res.status(http_status_codes_1.StatusCodes.OK).json({ success: true, message: "Success", data: { accountLink: accountLink.url } });
};
const webhook = async (req, res, next) => {
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
    const sig = req.headers["stripe-signature"];
    try {
        const webhook_event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
        let error, user, event, eventHost;
        if (webhook_event.type === "account.updated") {
            const account = webhook_event.data.object;
            const stripeAccountId = account.id;
            [error, user] = await (0, await_to_ts_1.default)(userModel_1.default.findOne({ stripeAccountId }));
            if (error)
                throw error;
            if (!user)
                throw (0, http_errors_1.default)(http_status_codes_1.StatusCodes.NOT_FOUND, "User not found");
            if (account.details_submitted && account.charges_enabled) {
                user.stripeAccoutStatus = true;
                [error] = await (0, await_to_ts_1.default)(user.save());
                if (error)
                    throw error;
            }
        }
        if (webhook_event.type === "payment_intent.succeeded") {
            const paymentIntent = webhook_event.data.object;
            const quantity = paymentIntent.metadata.quantity;
            const userId = paymentIntent.metadata.userId;
            const eventId = paymentIntent.metadata.eventId;
            console.log(`Payment succeeded for userId: ${userId}, eventId: ${eventId}`);
            [error, user] = await (0, await_to_ts_1.default)(userModel_1.default.findById(userId));
            if (error)
                throw error;
            if (!user) {
                console.error(`User not found for ID: ${userId}`);
                return res.status(http_status_codes_1.StatusCodes.OK).send();
            }
            console.log(user);
            [error, event] = await (0, await_to_ts_1.default)(eventModel_1.default.findById(eventId));
            if (error)
                throw error;
            if (!event) {
                console.error(`Event not found for ID: ${eventId}`);
                return res.status(http_status_codes_1.StatusCodes.OK).send();
            }
            console.log(event);
            [error, eventHost] = await (0, await_to_ts_1.default)(userModel_1.default.findById(event.host));
            if (error)
                throw error;
            if (!eventHost) {
                console.error(`Event host not found for ID: ${event.host}`);
                return res.status(http_status_codes_1.StatusCodes.OK).send();
            }
            console.log(eventHost);
            const ticket = {
                event: event._id,
                title: event.title,
                description: event.description,
                cover: event.cover,
                map: event.map,
                date: event.date,
                quantity: Number.parseInt(quantity),
                customId: (0, uuid_1.v4)(),
            };
            user.tickets?.push(ticket);
            console.log(user.tickets);
            const guest = {
                user: new mongoose_1.Types.ObjectId(userId),
                event: new mongoose_1.Types.ObjectId(eventId),
                name: user.name,
                avatar: user.avatar ?? null,
                quantity: Number.parseInt(quantity),
                eventTitle: event.title,
                eventDate: event.date,
            };
            eventHost.guests?.push(guest);
            await Promise.all([
                user.save(),
                eventHost.save(),
                eventModel_1.default.updateOne({ _id: eventId }, {
                    $inc: {
                        ticketSell: quantity,
                        availableTickets: -quantity,
                    },
                }),
            ]);
        }
        res.status(http_status_codes_1.StatusCodes.OK).send();
    }
    catch (error) {
        console.log(error);
        next(error);
    }
};
const StripeServices = {
    linkStripeAccount,
    webhook,
};
exports.default = StripeServices;
