"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const authRouter_1 = __importDefault(require("./routers/authRouter"));
const userRouter_1 = __importDefault(require("./routers/userRouter"));
const errorHandler_1 = require("./middlewares/errorHandler");
const stripeAccount_1 = __importDefault(require("./routers/stripeAccount"));
const eventRouter_1 = __importDefault(require("./routers/eventRouter"));
const notfound_1 = require("./middlewares/notfound");
const categoryRouter_1 = __importDefault(require("./routers/categoryRouter"));
const subCategoryRouter_1 = __importDefault(require("./routers/subCategoryRouter"));
const faqRouter_1 = __importDefault(require("./routers/faqRouter"));
const tacRouter_1 = __importDefault(require("./routers/tacRouter"));
const privacyRouter_1 = __importDefault(require("./routers/privacyRouter"));
const aboutRouter_1 = __importDefault(require("./routers/aboutRouter"));
const bookmarkRouter_1 = __importDefault(require("./routers/bookmarkRouter"));
const reviewRouter_1 = __importDefault(require("./routers/reviewRouter"));
const hiringRouter_1 = __importDefault(require("./routers/hiringRouter"));
const webhookRouter_1 = __importDefault(require("./routers/webhookRouter"));
const homeRouter_1 = __importDefault(require("./routers/homeRouter"));
const app = (0, express_1.default)();
app.use("/", webhookRouter_1.default);
app.use(express_1.default.json());
app.use((0, cors_1.default)({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
}));
app.use("/user", userRouter_1.default);
app.use("/auth", authRouter_1.default);
app.use("/account", stripeAccount_1.default);
app.use("/event", eventRouter_1.default);
app.use("/category", categoryRouter_1.default);
app.use("/subCategory", subCategoryRouter_1.default);
app.use("/bookmark", bookmarkRouter_1.default);
app.use("/review", reviewRouter_1.default);
app.use("/hiring", hiringRouter_1.default);
app.use("/home", homeRouter_1.default);
app.use("/tac", tacRouter_1.default);
app.use("/faq", faqRouter_1.default);
app.use("/privacy", privacyRouter_1.default);
app.use("/about", aboutRouter_1.default);
app.use("/", (req, res, next) => {
    res.send("Hello From Tha Drop Backend");
});
app.use(notfound_1.notFound);
app.use(errorHandler_1.errorHandler);
exports.default = app;
