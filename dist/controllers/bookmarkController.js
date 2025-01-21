"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const await_to_ts_1 = __importDefault(require("await-to-ts"));
const bookmarkModel_1 = __importDefault(require("../models/bookmarkModel"));
const http_status_codes_1 = require("http-status-codes");
const http_errors_1 = __importDefault(require("http-errors"));
const toggle = async (req, res, next) => {
    const userId = req.user.userId;
    const eventId = req.body.eventId;
    if (!userId || !eventId) {
        return next((0, http_errors_1.default)(http_status_codes_1.StatusCodes.BAD_REQUEST, "Missing eventId or userId"));
    }
    let error, bookmark;
    [error, bookmark] = await (0, await_to_ts_1.default)(bookmarkModel_1.default.findOne({ user: userId }));
    if (error)
        return next(error);
    console.log(bookmark);
    if (bookmark) {
        const isBookMarked = bookmark.event.includes(eventId);
        console.log(eventId, isBookMarked);
        if (isBookMarked) {
            console.log(bookmark.event);
            bookmark = await bookmarkModel_1.default.findByIdAndUpdate(bookmark._id, { $pull: { event: eventId } }, { new: true });
        }
        else {
            bookmark.event.push(eventId);
            await bookmark.save();
        }
        return res.status(http_status_codes_1.StatusCodes.OK).json({
            success: true,
            message: isBookMarked ? "Event removed from bookmarks" : "Event added to bookmarks",
            bookmarks: bookmark,
        });
    }
    else {
        [error, bookmark] = await (0, await_to_ts_1.default)(bookmarkModel_1.default.create({ user: userId, event: [eventId] }));
        if (error)
            return next(error);
        return res.status(201).json({
            success: true,
            message: "Event added to bookmarks",
            bookmarks: bookmark,
        });
    }
};
const get = async (req, res, next) => {
    const userId = req.user.userId;
    let error, bookmarks;
    [error, bookmarks] = await (0, await_to_ts_1.default)(bookmarkModel_1.default.findOne({ user: userId }).populate({ path: "event", select: "title cover _id map" }));
    console.log(bookmarks);
    if (error)
        return next(error);
    if (!bookmarks)
        return res.status(http_status_codes_1.StatusCodes.OK).json({ success: true, message: "No bookmark found", data: { bookmarks: [] } });
    return res.status(http_status_codes_1.StatusCodes.OK).json({ success: true, message: "Success", data: bookmarks });
};
const BookmarkController = {
    toggle,
    get,
};
exports.default = BookmarkController;
