"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const bookMarkSchema = new mongoose_1.Schema({
    user: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: true,
    },
    event: {
        type: [mongoose_1.Schema.Types.ObjectId],
        required: true,
    },
});
const Bookmark = (0, mongoose_1.model)("Bookmark", bookMarkSchema);
exports.default = Bookmark;
