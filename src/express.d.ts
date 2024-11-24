import { Request } from "express";
import { Types } from "mongoose";
import { DecodedUser } from "@models/user";
import { CategoryDocument } from "@models/category";
import { SubCategoryDocument } from "@models/subCategory";

declare global {
  namespace Express {
    interface Request {
      user: DecodedUser;
      category: CategoryDocument;
      subCategory: SubCategoryDocument;
    }
  }
}
