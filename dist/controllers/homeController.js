"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const await_to_ts_1 = __importDefault(require("await-to-ts"));
const eventModel_1 = __importDefault(require("../models/eventModel"));
const http_status_codes_1 = require("http-status-codes");
const userModel_1 = __importDefault(require("../models/userModel"));
const home = async (req, res, next) => {
    let error, events, users;
    [error, events] = await (0, await_to_ts_1.default)(eventModel_1.default.find().sort({ ticketSell: -1 }).limit(15).lean());
    if (error)
        return next(error);
    let top5, top10;
    if (events.length === 15) {
        top5 = events.slice(0, 5);
        top10 = events.slice(5, 10);
    }
    if (events.length > 5 && events.length < 15) {
        top5 = events.slice(0, 5);
        top10 = events.filter((_, index) => index >= 5);
    }
    if (events.length <= 5) {
        top5 = events;
        top10 = [];
    }
    [error, users] = await (0, await_to_ts_1.default)(userModel_1.default.find().sort({ averageRating: -1 }).limit(15).lean());
    if (error)
        return next(error);
    if (users.length === 0)
        return res.status(http_status_codes_1.StatusCodes.OK).json({ success: true, message: "Success", data: { top5, top10, users: [] } });
    return res.status(http_status_codes_1.StatusCodes.OK).json({ success: true, message: "Success", data: { top5, top10, users } });
};
const HommeController = {
    home,
};
exports.default = HommeController;
