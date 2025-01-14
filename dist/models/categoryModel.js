"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const subCategoryModel_1 = __importDefault(require("./subCategoryModel"));
const categorySchema = new mongoose_1.Schema({
    title: {
        type: String,
        required: true,
        unique: true
    },
    categoryImage: {
        type: String,
        required: true
    },
    subCategories: [
        {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: "SubCategory"
        }
    ]
});
categorySchema.pre("findOneAndDelete", async function (next) {
    const category = await this.model.findOne(this.getQuery());
    if (category) {
        await subCategoryModel_1.default.deleteMany({ _id: { $in: category.subCategories } });
    }
    next();
});
const Category = (0, mongoose_1.model)("Category", categorySchema);
exports.default = Category;
