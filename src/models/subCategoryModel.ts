import { Schema, model } from "mongoose";
import { SubCategorySchema } from "@schemas/subCategorySchema";

const subCategorySchema = new Schema<SubCategorySchema>({
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
            type: Schema.Types.ObjectId,
            ref: "Event"
        }
    ]
});

const SubCategory = model<SubCategorySchema>("SubCategory", subCategorySchema);
export default SubCategory;