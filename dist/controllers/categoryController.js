"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const await_to_ts_1 = __importDefault(require("await-to-ts"));
const http_errors_1 = __importDefault(require("http-errors"));
const categoryModel_1 = __importDefault(require("../models/categoryModel"));
const http_status_codes_1 = require("http-status-codes");
const cloudinary_1 = __importDefault(require("../shared/cloudinary"));
const create = async (req, res, next) => {
    const { title, categoryImageUrl } = req.body;
    if (!title || !categoryImageUrl)
        return next((0, http_errors_1.default)(http_status_codes_1.StatusCodes.BAD_REQUEST, "Category Title and Image is required"));
    const [error, category] = await (0, await_to_ts_1.default)(categoryModel_1.default.create({ title, categoryImage: categoryImageUrl }));
    if (error)
        return next(error);
    return res.status(http_status_codes_1.StatusCodes.CREATED).json({ success: true, message: "Success", data: category });
};
const get = async (req, res, next) => {
    const id = req.params.id;
    const [error, category] = await (0, await_to_ts_1.default)(categoryModel_1.default.findById(id).lean());
    if (error)
        return next(error);
    if (!category)
        return next((0, http_errors_1.default)(http_status_codes_1.StatusCodes.NOT_FOUND, "Category Not Found"));
    return res.status(http_status_codes_1.StatusCodes.OK).json({ success: true, message: "Success", data: category });
};
const getAll = async (req, res, next) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const [error, categories] = await (0, await_to_ts_1.default)(categoryModel_1.default.find().select("title categoryImage").skip(skip).limit(limit).lean());
    if (error)
        return next(error);
    const total = categories.length;
    const totalPages = Math.ceil(total / limit);
    if (!categories)
        return res.status(http_status_codes_1.StatusCodes.OK).json({
            success: true,
            message: "No Categories found",
            data: { categories: [], page, limit, total, totalPages },
        });
    return res
        .status(http_status_codes_1.StatusCodes.OK)
        .json({ success: true, message: "Success", data: { categories, page, limit, total, totalPages } });
};
const getSubCategories = async (req, res, next) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const id = req.params.id;
    const [error, category] = await (0, await_to_ts_1.default)(categoryModel_1.default.findById(id)
        .populate({ path: "subCategories", select: "title subCategoryImage", options: { skip, limit } })
        .lean());
    if (error)
        return next(error);
    if (!category)
        return next((0, http_errors_1.default)(http_status_codes_1.StatusCodes.NOT_FOUND, "Category not found"));
    const total = category.subCategories.length;
    const totalPages = Math.ceil(total / limit);
    if (total === 0)
        return res
            .status(http_status_codes_1.StatusCodes.OK)
            .json({ success: true, message: "No Subcategory found", data: { category, page, limit, total, totalPages } });
    return res
        .status(http_status_codes_1.StatusCodes.OK)
        .json({ success: true, message: "Success", data: { category, page, limit, total, totalPages } });
};
const update = async (req, res, next) => {
    const id = req.params.id;
    const { title, categoryImageUrl } = req.body;
    if (!title && !categoryImageUrl) {
        return next((0, http_errors_1.default)(http_status_codes_1.StatusCodes.BAD_REQUEST, "Nothing to update"));
    }
    let error, category;
    [error, category] = await (0, await_to_ts_1.default)(categoryModel_1.default.findById(id));
    if (error)
        return next(error);
    if (!category)
        return next((0, http_errors_1.default)(http_status_codes_1.StatusCodes.NOT_FOUND, "Category Not Found"));
    if (categoryImageUrl) {
        // await Cloudinary.remove(category.categoryImage);
        category.categoryImage = categoryImageUrl;
    }
    category.title = title || category.title;
    [error] = await (0, await_to_ts_1.default)(category.save());
    if (error)
        return next(error);
    return res.status(http_status_codes_1.StatusCodes.OK).json({ success: true, message: "Success", data: category });
};
const remove = async (req, res, next) => {
    const id = req.params.id;
    let error, category;
    [error, category] = await (0, await_to_ts_1.default)(categoryModel_1.default.findById(id));
    if (error)
        return next(error);
    if (!category)
        return next((0, http_errors_1.default)(http_status_codes_1.StatusCodes.NOT_FOUND, "Category Not Found"));
    if (category.categoryImage) {
        await cloudinary_1.default.remove(category.categoryImage);
    }
    [error] = await (0, await_to_ts_1.default)(categoryModel_1.default.findByIdAndDelete(id));
    if (error)
        return next(error);
    return res.status(http_status_codes_1.StatusCodes.OK).json({ success: true, message: "Success", data: {} });
};
const CategoryController = {
    create,
    getAll,
    get,
    getSubCategories,
    update,
    remove,
};
exports.default = CategoryController;
