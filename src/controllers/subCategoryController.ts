import to from "await-to-ts";
import { Types } from "mongoose";
import createError from "http-errors";
import { StatusCodes } from "http-status-codes";
import { NextFunction, Request, Response } from "express";
import Category from "@models/categoryModel";
import SubCategory from "@models/subCategoryModel";

const create = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  let error, category, subCategory;
  const { categoryId, title } = req.body;
  const subCategoryImage = (req as any).files.subCategoryImage;

  const imagePath = subCategoryImage[0].path;

  [error, category] = await to(Category.findById(categoryId));
  if (error) return next(error);
  if (!category) return next(createError(StatusCodes.NOT_FOUND, "Category not found!"));

  [error, subCategory] = await to(SubCategory.create({ title, subCategoryImage: imagePath }));
  if (error) return next(error);

  category.subCategories.push(subCategory._id as Types.ObjectId);
  [error] = await to(category.save());
  if (error) return next(error);

  return res.status(StatusCodes.CREATED).json({
    success: true,
    message: "Success",
    data: subCategory,
  });
};

const get = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  const id = req.params.id;
  const [error, subCategory] = await to(SubCategory.findById(id).populate("podcasts").lean());
  if (error) return next(error);
  if (!subCategory) return next(createError(StatusCodes.NOT_FOUND, "SubCategory not found!"));
  return res.status(StatusCodes.OK).json({ success: true, message: "Success", data: subCategory });
};

const getAll = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;

  const [error, subCategories] = await to(
    SubCategory.find()
      .populate({ path: "podcasts" })
      .select("title subCategories")
      .skip((page - 1) * limit)
      .limit(limit)
      .lean()
  );
  if (error) return next(error);
  if (!subCategories) return next(createError(StatusCodes.NOT_FOUND, "No Subcategories Found"));
  return res.status(StatusCodes.OK).json({ success: true, message: "Success", data: subCategories });
};

const getEvents = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  const id = req.params.id;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;

  const [error, subCategory] = await to(
    SubCategory.findById(id)
      .populate({
        path: "events",
        select: "title cover date",
        options: { skip, limit },
      })
      .select("title")
      .lean()
  );
  if (error) return next(error);
  if (!subCategory)
    return res
      .status(StatusCodes.NOT_FOUND)
      .json({ success: false, message: "SubCategory not found", data: { subCategory: [] } });

  const totalEvents = await SubCategory.countDocuments({ _id: id, events: { $exists: true } });
  const totalPages = Math.ceil(totalEvents / limit);

  return res.status(StatusCodes.OK).json({
    success: true,
    message: "Success",
    data: { subCategory, total: totalEvents, totalPages, page, limit },
  });
};

const update = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  const id = req.params.id;
  const title = req.body.title;
  const [error, subCategory] = await to(
    SubCategory.findOneAndUpdate({ _id: id }, { $set: { title: title } }, { new: true })
  );
  if (error) return next(error);
  if (!subCategory) return next(createError(StatusCodes.NOT_FOUND, "SubCategory not found"));
  return res.status(StatusCodes.OK).json({
    success: true,
    message: "Success",
    data: subCategory,
  });
};

const remove = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  const id = req.params.id;
  const [error, subCategory] = await to(SubCategory.findByIdAndDelete(id));
  if (error) return next(error);
  if (!subCategory) return next(createError(StatusCodes.NOT_FOUND, "SubCategory not found"));
  const category = await Category.findOneAndUpdate(
    { subCategories: id },
    { $pull: { subCategories: id } },
    { new: true }
  );
  if (!category) return next(createError(StatusCodes.NOT_FOUND, "Category Not Found"));
  return res.status(StatusCodes.OK).json({ success: true, message: "Success" });
};

const SubCategoryController = {
  create,
  get,
  getAll,
  update,
  remove,
};

export default SubCategoryController;
