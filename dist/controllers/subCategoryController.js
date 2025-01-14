"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const await_to_ts_1 = __importDefault(require("await-to-ts"));
const http_errors_1 = __importDefault(require("http-errors"));
const http_status_codes_1 = require("http-status-codes");
const categoryModel_1 = __importDefault(require("../models/categoryModel"));
const subCategoryModel_1 = __importDefault(require("../models/subCategoryModel"));
const create = async (req, res, next) => {
    const { categoryId, title, subcategoryImageUrl } = req.body;
    let error, category, subCategory;
    if (!categoryId || !title || !subcategoryImageUrl)
        return next((0, http_errors_1.default)(http_status_codes_1.StatusCodes.BAD_REQUEST, "Subcategory Title and Image is required"));
    [error, category] = await (0, await_to_ts_1.default)(categoryModel_1.default.findById(categoryId));
    if (error)
        return next(error);
    if (!category)
        return next((0, http_errors_1.default)(http_status_codes_1.StatusCodes.NOT_FOUND, "Category not found!"));
    [error, subCategory] = await (0, await_to_ts_1.default)(subCategoryModel_1.default.create({ title, subCategoryImage: subcategoryImageUrl }));
    if (error)
        return next(error);
    category.subCategories.push(subCategory._id);
    [error] = await (0, await_to_ts_1.default)(category.save());
    if (error)
        return next;
    return res.status(http_status_codes_1.StatusCodes.CREATED).json({
        success: true,
        message: "Success",
        data: subCategory,
    });
};
const get = async (req, res, next) => {
    const id = req.params.id;
    const [error, subCategory] = await (0, await_to_ts_1.default)(subCategoryModel_1.default.findById(id).lean());
    if (error)
        return next(error);
    if (!subCategory)
        return next((0, http_errors_1.default)(http_status_codes_1.StatusCodes.NOT_FOUND, "SubCategory not found!"));
    return res.status(http_status_codes_1.StatusCodes.OK).json({ success: true, message: "Success", data: subCategory });
};
const getAll = async (req, res, next) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const [error, subCategories] = await (0, await_to_ts_1.default)(subCategoryModel_1.default.aggregate([
        {
            $lookup: {
                from: "categories",
                localField: "_id",
                foreignField: "subCategories",
                as: "category",
            },
        },
        {
            $unwind: {
                path: "$category",
                preserveNullAndEmptyArrays: true,
            },
        },
        {
            $project: {
                title: 1,
                subCategoryImage: 1,
                categoryTitle: "$category.title",
            },
        },
        { $skip: skip },
        { $limit: limit },
    ]));
    if (error) {
        return next(error);
    }
    const [countError, totalCount] = await (0, await_to_ts_1.default)(subCategoryModel_1.default.countDocuments());
    if (countError) {
        return next(countError);
    }
    const totalPages = Math.ceil(totalCount / limit);
    res.status(200).json({
        success: true,
        message: "Success",
        data: { subCategories, totalCount, page, totalPages, limit },
    });
};
const getEvents = async (req, res, next) => {
    const id = req.params.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const [error, subCategory] = await (0, await_to_ts_1.default)(subCategoryModel_1.default.findById(id)
        .populate({
        path: "events",
        select: "title cover date map",
        options: { skip, limit },
    })
        .select("title")
        .lean());
    if (error)
        return next(error);
    if (!subCategory)
        return res
            .status(http_status_codes_1.StatusCodes.NOT_FOUND)
            .json({ success: false, message: "SubCategory not found", data: { subCategory: [] } });
    const totalEvents = subCategory.events.length;
    const totalPages = Math.ceil(totalEvents / limit);
    return res.status(http_status_codes_1.StatusCodes.OK).json({
        success: true,
        message: "Success",
        data: { subCategory, total: totalEvents, totalPages, page, limit },
    });
};
const update = async (req, res, next) => {
    const id = req.params.id;
    const { title, subcategoryImageUrl } = req.body;
    if (!title && !subcategoryImageUrl) {
        return next((0, http_errors_1.default)(http_status_codes_1.StatusCodes.BAD_REQUEST, "Nothing to update"));
    }
    let error, subCategory;
    [error, subCategory] = await (0, await_to_ts_1.default)(subCategoryModel_1.default.findById(id));
    if (error)
        return next(error);
    if (!subCategory)
        return next((0, http_errors_1.default)(http_status_codes_1.StatusCodes.NOT_FOUND, "SubCategory not found"));
    if (subcategoryImageUrl) {
        // await Cloudinary.remove(subCategory.subCategoryImage);
        subCategory.subCategoryImage = subcategoryImageUrl;
    }
    subCategory.title = title || subCategory.title;
    [error] = await (0, await_to_ts_1.default)(subCategory.save());
    if (error)
        return next(error);
    return res.status(http_status_codes_1.StatusCodes.OK).json({
        success: true,
        message: "Success",
        data: subCategory,
    });
};
const remove = async (req, res, next) => {
    const id = req.params.id;
    let error, subCategory;
    [error, subCategory] = await (0, await_to_ts_1.default)(subCategoryModel_1.default.findById(id));
    if (error)
        return next(error);
    if (!subCategory)
        return next((0, http_errors_1.default)(http_status_codes_1.StatusCodes.NOT_FOUND, "SubCategory not found"));
    if (subCategory.subCategoryImage) {
        // await Cloudinary.remove(subCategory.subCategoryImage);
    }
    [error] = await (0, await_to_ts_1.default)(subCategoryModel_1.default.findByIdAndDelete(id));
    if (error)
        return next(error);
    const category = await categoryModel_1.default.findOneAndUpdate({ subCategories: id }, { $pull: { subCategories: id } }, { new: true });
    if (!category)
        return next((0, http_errors_1.default)(http_status_codes_1.StatusCodes.NOT_FOUND, "Category Not Found"));
    return res.status(http_status_codes_1.StatusCodes.OK).json({ success: true, message: "Success", data: {} });
};
const SubCategoryController = {
    create,
    getAll,
    get,
    update,
    remove,
    getEvents,
};
exports.default = SubCategoryController;
