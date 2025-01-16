"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcrypt_1 = __importDefault(require("bcrypt"));
const await_to_ts_1 = __importDefault(require("await-to-ts"));
const mongoose_1 = __importDefault(require("mongoose"));
const http_errors_1 = __importDefault(require("http-errors"));
const http_status_codes_1 = require("http-status-codes");
const jwt_1 = require("../utils/jwt");
const authModel_1 = __importDefault(require("../models/authModel"));
const userModel_1 = __importDefault(require("../models/userModel"));
const enum_1 = require("../shared/enum");
const sendEmail_1 = __importDefault(require("../utils/sendEmail"));
const generateOTP_1 = __importDefault(require("../utils/generateOTP"));
const stripe_1 = __importDefault(require("stripe"));
const stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY);
const register = async (req, res, next) => {
    const { name, email, phoneNumber, role, password, confirmPassword, licenseUrl } = req.body;
    let error, auth, user;
    const hashedPassword = await bcrypt_1.default.hash(password, 10);
    const verificationOTP = (0, generateOTP_1.default)();
    const verificationOTPExpiredAt = new Date(Date.now() + 60 * 1000);
    [error, auth] = await (0, await_to_ts_1.default)(authModel_1.default.findOne({ email }));
    if (error)
        return next(error);
    if (auth) {
        return res
            .status(http_status_codes_1.StatusCodes.CONFLICT)
            .json({ success: false, message: "Email already exists.", data: { isVerified: auth.isVerified } });
    }
    const session = await mongoose_1.default.startSession();
    session.startTransaction();
    try {
        [error, auth] = await (0, await_to_ts_1.default)(authModel_1.default.create({
            email,
            password: hashedPassword,
            role,
            verificationOTP,
            verificationOTPExpiredAt,
            isVerified: false,
            isBlocked: false,
            isApproved: role === enum_1.Role.GUEST || role === enum_1.Role.ADMIN,
        }));
        if (error)
            throw error;
        [error, user] = await (0, await_to_ts_1.default)(userModel_1.default.create({
            auth: auth._id,
            name,
            phoneNumber,
            licensePhoto: licenseUrl,
        }));
        if (error)
            throw error;
        await session.commitTransaction();
        await (0, sendEmail_1.default)(email, verificationOTP);
        return res.status(http_status_codes_1.StatusCodes.CREATED).json({
            success: true,
            message: "Success",
            data: { isVerified: auth.isVerified, verificationOTP: auth.verificationOTP },
        });
    }
    catch (error) {
        await session.abortTransaction();
        return next(error);
    }
    finally {
        await session.endSession();
    }
};
const activate = async (req, res, next) => {
    const { email, verificationOTP } = req.body;
    const [error, auth] = await (0, await_to_ts_1.default)(authModel_1.default.findOne({ email }).select("-password"));
    if (error)
        return next(error);
    if (!auth)
        return next((0, http_errors_1.default)(http_status_codes_1.StatusCodes.NOT_FOUND, "Account Not found"));
    if (auth.verificationOTP === "" || auth.verificationOTPExpiredAt === null)
        return next((0, http_errors_1.default)(http_status_codes_1.StatusCodes.UNAUTHORIZED, "Verification OTP has expired"));
    if (verificationOTP !== auth.verificationOTP)
        return next((0, http_errors_1.default)(http_status_codes_1.StatusCodes.UNAUTHORIZED, "Wrong OTP"));
    auth.verificationOTP = "";
    auth.verificationOTPExpiredAt = null;
    auth.isVerified = true;
    await auth.save();
    const accessSecret = process.env.JWT_ACCESS_SECRET;
    if (!accessSecret)
        return next((0, http_errors_1.default)(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR, "JWT secret is not defined."));
    const accessToken = (0, jwt_1.generateToken)(auth._id.toString(), accessSecret, "96h");
    const user = await userModel_1.default.findOne({ auth: auth._id });
    return res.status(http_status_codes_1.StatusCodes.OK).json({ success: true, message: "Success", data: { accessToken, auth, user } });
};
const resendOTP = async (req, res, next) => {
    const { email, status } = req.body;
    let error, auth;
    [error, auth] = await (0, await_to_ts_1.default)(authModel_1.default.findOne({ email: email }));
    if (error)
        return next(error);
    if (!auth)
        return next((0, http_errors_1.default)(http_status_codes_1.StatusCodes.NOT_FOUND, "Account not found"));
    let verificationOTP, recoveryOTP;
    if (status === "activate" && auth.isVerified)
        return res
            .status(http_status_codes_1.StatusCodes.OK)
            .json({ success: true, message: "Your account is already verified. Please login.", data: {} });
    if (status === "activate" && !auth.isVerified) {
        verificationOTP = (0, generateOTP_1.default)();
        auth.verificationOTP = verificationOTP;
        auth.verificationOTPExpiredAt = new Date(Date.now() + 60 * 1000);
        [error] = await (0, await_to_ts_1.default)(auth.save());
        if (error)
            return next(error);
        (0, sendEmail_1.default)(email, verificationOTP);
    }
    if (status === "recovery") {
        recoveryOTP = (0, generateOTP_1.default)();
        auth.recoveryOTP = recoveryOTP;
        auth.recoveryOTPExpiredAt = new Date(Date.now() + 60 * 1000);
        [error] = await (0, await_to_ts_1.default)(auth.save());
        if (error)
            return next(error);
        (0, sendEmail_1.default)(email, recoveryOTP);
    }
    return res.status(http_status_codes_1.StatusCodes.OK).json({ success: true, message: "Success", data: { verificationOTP, recoveryOTP } });
};
const login = async (req, res, next) => {
    console.log(req);
    const { email, password } = req.body;
    console.log(req.body);
    console.log(email, password);
    let error, auth, isPasswordValid;
    [error, auth] = await (0, await_to_ts_1.default)(authModel_1.default.findOne({ email }));
    if (error)
        return next(error);
    if (!auth)
        return next((0, http_errors_1.default)(http_status_codes_1.StatusCodes.NOT_FOUND, "No account found with the given email"));
    [error, isPasswordValid] = await (0, await_to_ts_1.default)(bcrypt_1.default.compare(password, auth.password));
    if (error)
        return next(error);
    if (!isPasswordValid)
        return next((0, http_errors_1.default)(http_status_codes_1.StatusCodes.UNAUTHORIZED, "Wrong password"));
    if (!auth.isVerified)
        return next((0, http_errors_1.default)(http_status_codes_1.StatusCodes.UNAUTHORIZED, "Verify your email first"));
    if (auth.isBlocked)
        return next((0, http_errors_1.default)(http_status_codes_1.StatusCodes.FORBIDDEN, "Your account had been blocked. Contact Administrator"));
    const accessSecret = process.env.JWT_ACCESS_SECRET;
    const refreshSecret = process.env.JWT_REFRESH_SECRET;
    if (!accessSecret || !refreshSecret)
        return next((0, http_errors_1.default)(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR, "JWT secret is not defined."));
    const accessToken = (0, jwt_1.generateToken)(auth._id.toString(), accessSecret, "96h");
    const refreshToken = (0, jwt_1.generateToken)(auth._id.toString(), refreshSecret, "96h");
    const user = await userModel_1.default.findOne({ auth: auth._id });
    return res.status(http_status_codes_1.StatusCodes.OK).json({
        success: true,
        message: "Success",
        data: { accessToken, refreshToken, auth, user },
    });
};
const forgotPassword = async (req, res, next) => {
    const { email } = req.body;
    const [error, auth] = await (0, await_to_ts_1.default)(authModel_1.default.findOne({ email }));
    if (error)
        return next(error);
    if (!auth)
        return next((0, http_errors_1.default)(http_status_codes_1.StatusCodes.NOT_FOUND, "Account Not Found"));
    const recoveryOTP = (0, generateOTP_1.default)();
    auth.recoveryOTP = recoveryOTP;
    auth.recoveryOTPExpiredAt = new Date(Date.now() + 60 * 1000);
    await auth.save();
    await (0, sendEmail_1.default)(email, recoveryOTP);
    return res.status(http_status_codes_1.StatusCodes.OK).json({ success: true, message: "Success", data: {} });
};
const recoveryVerification = async (req, res, next) => {
    const { email, recoveryOTP } = req.body;
    const [error, auth] = await (0, await_to_ts_1.default)(authModel_1.default.findOne({ email }).select("-password"));
    if (error)
        return next(error);
    if (!auth)
        return next((0, http_errors_1.default)(http_status_codes_1.StatusCodes.NOT_FOUND, "Account Not found"));
    if (auth.recoveryOTP === "" || auth.recoveryOTPExpiredAt === null)
        return next((0, http_errors_1.default)(http_status_codes_1.StatusCodes.UNAUTHORIZED, "Verification OTP has expired"));
    if (recoveryOTP !== auth.recoveryOTP)
        return next((0, http_errors_1.default)(http_status_codes_1.StatusCodes.UNAUTHORIZED, "Wrong OTP"));
    auth.recoveryOTP = "";
    auth.recoveryOTPExpiredAt = null;
    await auth.save();
    const recoverySecret = process.env.JWT_RECOVERY_SECRET;
    if (!recoverySecret)
        return next((0, http_errors_1.default)(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR, "JWT secret is not defined."));
    const recoveryToken = (0, jwt_1.generateToken)(auth._id.toString(), recoverySecret, "96h");
    return res.status(http_status_codes_1.StatusCodes.OK).json({ success: true, message: "Success", data: recoveryToken });
};
const resetPassword = async (req, res, next) => {
    const user = req.user;
    const { password, confirmPassword } = req.body;
    const [error, auth] = await (0, await_to_ts_1.default)(authModel_1.default.findOne({ email: user.email }));
    if (error)
        return next(error);
    if (!auth)
        return next((0, http_errors_1.default)(http_status_codes_1.StatusCodes.NOT_FOUND, "Account Not Found"));
    if (password !== confirmPassword)
        return next((0, http_errors_1.default)(http_status_codes_1.StatusCodes.BAD_REQUEST, "Passwords don't match"));
    auth.password = await bcrypt_1.default.hash(password, 10);
    await auth.save();
    return res.status(http_status_codes_1.StatusCodes.OK).json({ success: true, message: "Success", data: {} });
};
const changePassword = async (req, res, next) => {
    const user = req.user;
    const { password, newPassword, confirmPassword } = req.body;
    let error, auth, isMatch;
    [error, auth] = await (0, await_to_ts_1.default)(authModel_1.default.findById(user.authId));
    if (error)
        return next(error);
    if (!auth)
        return next((0, http_errors_1.default)(http_status_codes_1.StatusCodes.NOT_FOUND, "Account Not Found"));
    [error, isMatch] = await (0, await_to_ts_1.default)(bcrypt_1.default.compare(password, auth.password));
    if (error)
        return next(error);
    if (!isMatch)
        return next((0, http_errors_1.default)(http_status_codes_1.StatusCodes.UNAUTHORIZED, "Wrong Password"));
    auth.password = await bcrypt_1.default.hash(newPassword, 10);
    await auth.save();
    return res.status(http_status_codes_1.StatusCodes.OK).json({ success: true, message: "Success", data: {} });
};
const remove = async (req, res, next) => {
    const user = req.user;
    const session = await mongoose_1.default.startSession();
    try {
        session.startTransaction();
        await authModel_1.default.findByIdAndDelete(user.authId);
        await userModel_1.default.findByIdAndDelete(user.userId);
        await session.commitTransaction();
        await session.endSession();
        return res.status(http_status_codes_1.StatusCodes.OK).json({ success: true, message: "Success", data: {} });
    }
    catch (error) {
        if (session.inTransaction()) {
            await session.abortTransaction();
            await session.endSession();
        }
        return next((0, http_errors_1.default)(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR, "Failed to delete account"));
    }
    finally {
        await session.endSession();
    }
};
const getAccessToken = async (req, res, next) => {
    const user = req.user;
    const secret = process.env.JWT_ACCESS_SECRET;
    if (!secret) {
        return next((0, http_errors_1.default)(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR, "JWT secret is not defined."));
    }
    const accessToken = (0, jwt_1.generateToken)(user.authId, secret, "96h");
    if (!accessToken)
        return next((0, http_errors_1.default)(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR, "Failed"));
    res.status(http_status_codes_1.StatusCodes.OK).json({ success: true, message: "Success", data: accessToken });
};
const AuthController = {
    register,
    activate,
    login,
    forgotPassword,
    recoveryVerification,
    resetPassword,
    changePassword,
    resendOTP,
    getAccessToken,
    remove,
};
exports.default = AuthController;
