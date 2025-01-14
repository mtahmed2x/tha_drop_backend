"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const reviewController_1 = __importDefault(require("../controllers/reviewController"));
const authorization_1 = require("../middlewares/authorization");
const router = express_1.default.Router();
router.post("/create", authorization_1.authorize, reviewController_1.default.create);
router.put("/update/:id", reviewController_1.default.update);
exports.default = router;
