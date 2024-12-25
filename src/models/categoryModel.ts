import { Schema, model } from "mongoose";
import SubCategory from "@models/subCategoryModel";
import { CategorySchema } from "@schemas/categorySchema";

const categorySchema = new Schema<CategorySchema>({
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
            type: Schema.Types.ObjectId,
            ref: "SubCategory"
        }
    ]
});

categorySchema.pre("findOneAndDelete", async function(next) {
    const category = await this.model.findOne(this.getQuery());
    if (category) {
        await SubCategory.deleteMany({ _id: { $in: category.subCategories } });
    }
    next();
});

const Category = model<CategorySchema>("Category", categorySchema);
export default Category;