"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const categoryController_1 = __importDefault(require("../controllers/categoryController"));
const authorization_1 = require("../middlewares/authorization");
const uploadFile_1 = require("../middlewares/uploadFile");
const express_fileupload_1 = __importDefault(require("express-fileupload"));
const fileHandler_1 = __importDefault(require("../middlewares/fileHandler"));
const CategoryRouter = express_1.default.Router();
CategoryRouter.post("/create", (0, express_fileupload_1.default)(), fileHandler_1.default, authorization_1.authorize, authorization_1.isAdmin, categoryController_1.default.create);
CategoryRouter.get("/", authorization_1.authorize, categoryController_1.default.getAll);
CategoryRouter.get("/:id", authorization_1.authorize, categoryController_1.default.get);
CategoryRouter.put("/update/:id", authorization_1.authorize, authorization_1.isAdmin, uploadFile_1.handleFileUpload, categoryController_1.default.update);
CategoryRouter.delete("/delete/:id", (0, express_fileupload_1.default)(), fileHandler_1.default, authorization_1.authorize, authorization_1.isAdmin, categoryController_1.default.remove);
CategoryRouter.get("/:id/sub-categories", authorization_1.authorize, categoryController_1.default.getSubCategories);
exports.default = CategoryRouter;
