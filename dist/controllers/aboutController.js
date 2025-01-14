"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const aboutModel_1 = __importDefault(require("../models/aboutModel"));
const await_to_ts_1 = __importDefault(require("await-to-ts"));
const http_status_codes_1 = require("http-status-codes");
const http_errors_1 = __importDefault(require("http-errors"));
const create = async (req, res, next) => {
    const text = req.body.text;
    const [error, about] = await (0, await_to_ts_1.default)(aboutModel_1.default.create({ text: text }));
    if (error)
        return next(error);
    return res.status(http_status_codes_1.StatusCodes.CREATED).json({ success: true, message: "Success", data: about });
};
const get = async (req, res, next) => {
    const [error, about] = await (0, await_to_ts_1.default)(aboutModel_1.default.findOne().lean());
    if (error)
        return next(error);
    if (!about)
        return res.status(http_status_codes_1.StatusCodes.OK).json({ success: true, message: "No about us", data: about });
    return res.status(http_status_codes_1.StatusCodes.OK).json({ success: true, message: "Success", data: about });
};
const update = async (req, res, next) => {
    const id = req.params.id;
    const text = req.body.text;
    const [error, about] = await (0, await_to_ts_1.default)(aboutModel_1.default.findByIdAndUpdate(id, { $set: { text: text } }, { new: true }));
    if (error)
        return next(error);
    if (!about)
        return next((0, http_errors_1.default)(http_status_codes_1.StatusCodes.NOT_FOUND, "About us not found"));
    return res.status(http_status_codes_1.StatusCodes.OK).json({ success: true, message: "Success", data: about });
};
const AboutController = {
    create,
    get,
    update,
};
exports.default = AboutController;
