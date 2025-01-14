"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const faqModel_1 = __importDefault(require("../models/faqModel"));
const await_to_ts_1 = __importDefault(require("await-to-ts"));
const http_errors_1 = __importDefault(require("http-errors"));
const http_status_codes_1 = require("http-status-codes");
const create = async (req, res, next) => {
    const { question, answer } = req.body;
    const [error, faq] = await (0, await_to_ts_1.default)(faqModel_1.default.create({ question, answer }));
    if (error)
        return next(error);
    res.status(http_status_codes_1.StatusCodes.CREATED).json({ success: true, message: "Success", data: faq });
};
const get = async (req, res, next) => {
    const [error, faqs] = await (0, await_to_ts_1.default)(faqModel_1.default.find());
    if (error)
        return next(error);
    if (faqs.length === 0)
        return res.status(http_status_codes_1.StatusCodes.OK).json({ success: true, message: "No FAQ found", data: { faqs: [] } });
    return res.status(http_status_codes_1.StatusCodes.OK).json({ success: true, message: "Success", data: faqs });
};
const update = async (req, res, next) => {
    const id = req.params.id;
    const { question, answer } = req.body;
    let updateFields = {};
    if (question)
        updateFields.question = question;
    if (answer)
        updateFields.answer = answer;
    const [error, faq] = await (0, await_to_ts_1.default)(faqModel_1.default.findByIdAndUpdate(id, { $set: updateFields }, { new: true }));
    if (error)
        return next(error);
    if (!faq)
        return next((0, http_errors_1.default)(http_status_codes_1.StatusCodes.NOT_FOUND, "Faq Not Found"));
    res.status(http_status_codes_1.StatusCodes.OK).json({ success: true, message: "Success", data: faq });
};
const remove = async (req, res, next) => {
    const id = req.params.id;
    const [error, faq] = await (0, await_to_ts_1.default)(faqModel_1.default.findByIdAndDelete(id));
    if (error)
        return next(error);
    if (!faq)
        return next((0, http_errors_1.default)(http_status_codes_1.StatusCodes.NOT_FOUND, "Faq Not Found"));
    res.status(http_status_codes_1.StatusCodes.OK).json({ success: true, message: "Success", data: {} });
};
const FaqController = {
    create,
    get,
    update,
    remove,
};
exports.default = FaqController;
