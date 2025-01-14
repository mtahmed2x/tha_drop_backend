"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const subCategorySchema = new mongoose_1.Schema({
    title: {
        type: String,
        required: true,
        unique: true
    },
    subCategoryImage: {
        type: String,
        required: true
    },
    events: [
        {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: "Event"
        }
    ]
});
const SubCategory = (0, mongoose_1.model)("SubCategory", subCategorySchema);
exports.default = SubCategory;
