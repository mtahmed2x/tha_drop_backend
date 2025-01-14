"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const hiringServices_1 = __importDefault(require("../services/hiringServices"));
const authorization_1 = require("../middlewares/authorization");
const router = express_1.default.Router();
router.post("/hire", authorization_1.authorize, hiringServices_1.default.hire);
router.post("/accept", authorization_1.authorize, hiringServices_1.default.acceptRequest);
router.post("/reject", authorization_1.authorize, hiringServices_1.default.rejectRequest);
router.get("/available", hiringServices_1.default.getAvailableHire);
exports.default = router;
