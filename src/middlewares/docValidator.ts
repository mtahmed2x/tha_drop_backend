import to from "await-to-ts";
import { Request, Response } from "express";
import Category from "@models/category";
import SubCategory from "@models/subCategory";
import handleError from "@utils/handleError";

export const categoryValidator = async (
  req: Request,
  res: Response,
  next: Function
): Promise<any> => {
  const categoryId = req.body.categoryId;
  console.log(categoryId);
  const [error, category] = await to(Category.findById(categoryId));
  if (error) handleError(error, res);
  if (!category) {
    return res.status(404).json({ error: "Category not found!" });
  }
  req.category = category;
  next();
};

export const subCategoryValidator = async (
  req: Request,
  res: Response,
  next: Function
): Promise<any> => {
  const subCategoryId = req.body.subCategoryId;
  const [error, subCategory] = await to(SubCategory.findById(subCategoryId));
  if (error) handleError(error, res);
  if (!subCategory) {
    return res.status(404).json({ error: "SubCategory not found!" });
  }
  req.subCategory = subCategory;
  next();
};
