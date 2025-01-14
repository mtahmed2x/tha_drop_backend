"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const stripeAccount_1 = __importDefault(require("../controllers/stripeAccount"));
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
router.post("/link", stripeAccount_1.default.linkAccount);
router.post("/login", stripeAccount_1.default.loginAccount);
router.post("/update", stripeAccount_1.default.updateSchedule);
exports.default = router;
