"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const stripe_1 = __importDefault(require("stripe"));
const stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY);
const await_to_ts_1 = __importDefault(require("await-to-ts"));
const linkAccount = async (req, res) => {
    const { id } = req.body;
    const accountLink = await stripe.accountLinks.create({
        account: id,
        refresh_url: `https://example.com/cancel`, // Redirect here if they need to re-submit
        return_url: `https://example.com/success`, // Redirect here upon successful onboarding
        type: "account_onboarding",
    });
    return res.status(200).json({ accountLink, id });
};
const loginAccount = async (req, res, next) => {
    const { id } = req.body;
    const [error, login] = await (0, await_to_ts_1.default)(stripe.accounts.createLoginLink(id));
    if (error)
        return next(error);
    return res.status(200).json({ login });
};
const updateSchedule = async (req, res, next) => {
    const { id } = req.body;
    const account = await stripe.accounts.update(id, {
        settings: {
            payouts: {
                schedule: {
                    interval: "daily",
                },
            },
        },
    });
    return res.status(200).json({ account });
};
const AccountController = {
    linkAccount,
    loginAccount,
    updateSchedule,
};
exports.default = AccountController;
