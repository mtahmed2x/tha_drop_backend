"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const aboutController_1 = __importDefault(require("../controllers/aboutController"));
const authorization_1 = require("../middlewares/authorization");
const router = express_1.default.Router();
router.post("/create", authorization_1.authorize, authorization_1.isAdmin, aboutController_1.default.create);
router.get("/", authorization_1.authorize, aboutController_1.default.get);
router.put("/update/:id", authorization_1.authorize, authorization_1.isAdmin, aboutController_1.default.update);
exports.default = router;
