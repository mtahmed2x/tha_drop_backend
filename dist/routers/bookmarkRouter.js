"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const bookmarkController_1 = __importDefault(require("../controllers/bookmarkController"));
const authorization_1 = require("../middlewares/authorization");
const router = express_1.default.Router();
router.post("/toggle", authorization_1.authorize, bookmarkController_1.default.toggle);
router.get("/", authorization_1.authorize, bookmarkController_1.default.get);
exports.default = router;
