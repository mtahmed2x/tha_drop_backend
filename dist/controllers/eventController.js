"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const await_to_ts_1 = __importDefault(require("await-to-ts"));
const http_status_codes_1 = require("http-status-codes");
const eventModel_1 = __importDefault(require("../models/eventModel"));
const stripe_1 = __importDefault(require("stripe"));
const http_errors_1 = __importDefault(require("http-errors"));
const cloudinary_1 = __importDefault(require("../shared/cloudinary"));
const subCategoryModel_1 = __importDefault(require("../models/subCategoryModel"));
const mongoose_1 = require("mongoose");
const bookmarkModel_1 = __importDefault(require("../models/bookmarkModel"));
const stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY);
const create = async (req, res, next) => {
    const userId = req.user.userId;
    const { title, organizer, categoryId, subCategoryId, date, description, coverUrl, galleryUrls, deadline, location, latitude, longitude, } = req.body;
    const ticketPrice = parseInt(req.body.ticketPrice);
    const availableTickets = parseInt(req.body.availableTickets);
    let error, product, price, event, subCategory;
    [error, product] = await (0, await_to_ts_1.default)(stripe.products.create({
        name: title,
        description: description,
    }));
    if (error)
        return next(error);
    [error, price] = await (0, await_to_ts_1.default)(stripe.prices.create({
        product: product.id,
        unit_amount: ticketPrice,
        currency: "usd",
    }));
    if (error)
        return next(error);
    [error, subCategory] = await (0, await_to_ts_1.default)(subCategoryModel_1.default.findById(subCategoryId));
    if (error)
        return next(error);
    if (!subCategory)
        return next((0, http_errors_1.default)(http_status_codes_1.StatusCodes.NOT_FOUND, "Subcategory not found"));
    [error, event] = await (0, await_to_ts_1.default)(eventModel_1.default.create({
        title,
        organizer,
        host: userId,
        category: categoryId,
        subCategory: subCategoryId,
        date,
        description,
        cover: coverUrl,
        gallery: galleryUrls,
        ticketPrice,
        productId: product.id,
        ticketPriceId: price.id,
        deadline,
        availableTickets,
        map: {
            location,
            latitude: Number.parseFloat(latitude),
            longitude: Number.parseFloat(longitude),
        },
    }));
    if (error)
        return next(error);
    subCategory.events.push(event._id);
    [error] = await (0, await_to_ts_1.default)(subCategory.save());
    if (error)
        return next(error);
    return res.status(http_status_codes_1.StatusCodes.CREATED).json({ success: true, message: "Success", data: event });
};
const get = async (req, res, next) => {
    const userId = req.user.userId;
    const id = req.params.id;
    const [error, event] = await (0, await_to_ts_1.default)(eventModel_1.default.findById(id)
        .populate({ path: "host", select: "name" })
        .populate({ path: "category", select: "title" })
        .populate({ path: "subCategory", select: "title" })
        .lean());
    if (error)
        return next(error);
    if (!event)
        return next((0, http_errors_1.default)(http_status_codes_1.StatusCodes.NOT_FOUND, "Event Not Found"));
    let isBookmarked = false;
    const bookmark = await bookmarkModel_1.default.findOne({ user: userId });
    if (bookmark) {
        isBookmarked = bookmark.event.includes(new mongoose_1.Types.ObjectId(id));
    }
    return res.status(http_status_codes_1.StatusCodes.OK).json({ success: true, message: "Success", data: { event, isBookmarked } });
};
const getAll = async (req, res, next) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const [error, events] = await (0, await_to_ts_1.default)(eventModel_1.default.find()
        .populate({ path: "host", select: "name" })
        .populate({ path: "category", select: "title" })
        .populate({ path: "subCategory", select: "title" })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean());
    if (error)
        return next(error);
    if (!events)
        return next((0, http_errors_1.default)(http_status_codes_1.StatusCodes.NOT_FOUND, "Event Not Found"));
    return res.status(http_status_codes_1.StatusCodes.OK).json({ success: true, message: "Success", data: events });
};
const update = async (req, res, next) => {
    const id = req.params.id;
    const { title, organizer, description, coverUrl, currentGalleryUrls, galleryUrls, availableTickets, deadline } = req.body;
    try {
        // Fetch the event
        const event = await eventModel_1.default.findById(id);
        if (!event) {
            return next((0, http_errors_1.default)(http_status_codes_1.StatusCodes.NOT_FOUND, "Event Not Found"));
        }
        // Update title and description, if provided
        if (title || description) {
            const updatedTitle = title || event.title;
            const updatedDescription = description || event.description;
            await stripe.products.update(event.productId, {
                name: updatedTitle,
                description: updatedDescription,
            });
            event.title = updatedTitle;
            event.description = updatedDescription;
        }
        // Update other fields
        event.organizer = organizer || event.organizer;
        event.deadline = deadline || event.deadline;
        event.availableTickets = availableTickets || event.availableTickets;
        // Handle cover image update
        if (coverUrl) {
            if (event.cover) {
                await cloudinary_1.default.remove(event.cover);
            }
            event.cover = coverUrl;
        }
        // Handle gallery update
        const currentGallery = currentGalleryUrls || [];
        const newGallery = galleryUrls || [];
        // Remove images not in the updated gallery
        const imagesToRemove = event.gallery.filter((url) => !currentGallery.includes(url));
        await Promise.all(imagesToRemove.map((url) => cloudinary_1.default.remove(url)));
        // Update gallery
        event.gallery = [...currentGallery, ...newGallery];
        // Save changes
        await event.save();
        return res.status(http_status_codes_1.StatusCodes.OK).json({
            success: true,
            message: "Success",
            data: event, // Consider sanitizing the response
        });
    }
    catch (error) {
        return next(error);
    }
};
const remove = async (req, res, next) => {
    const id = req.params.id;
    const [error, event] = await (0, await_to_ts_1.default)(eventModel_1.default.findByIdAndDelete(id));
    if (error)
        return next(error);
    if (!event)
        return next((0, http_errors_1.default)(http_status_codes_1.StatusCodes.NOT_FOUND, "Event Not Found"));
    return res.status(http_status_codes_1.StatusCodes.OK).json({ success: true, message: "Success", data: {} });
};
const search = async (req, res, next) => {
    const searchTerm = req.query.q;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    if (!searchTerm || searchTerm.trim() === "") {
        return next((0, http_errors_1.default)(http_status_codes_1.StatusCodes.BAD_REQUEST, "Search term is required"));
    }
    const regex = new RegExp(searchTerm, "i");
    const [error, events] = await (0, await_to_ts_1.default)(eventModel_1.default.find({ title: { $regex: regex } })
        .populate({ path: "host", select: "name" })
        .populate({ path: "category", select: "title" })
        .populate({ path: "subCategory", select: "title" })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean());
    if (error)
        return next(error);
    if (!events || events.length === 0) {
        return next((0, http_errors_1.default)(http_status_codes_1.StatusCodes.NOT_FOUND, "No events found matching the search term"));
    }
    return res.status(http_status_codes_1.StatusCodes.OK).json({
        success: true,
        message: "Success",
        data: events,
    });
};
const EventController = {
    create,
    get,
    getAll,
    search,
    update,
    remove,
};
exports.default = EventController;
