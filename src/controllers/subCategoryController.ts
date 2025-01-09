import to from "await-to-ts";
import { Types } from "mongoose";
import createError from "http-errors";
import { StatusCodes } from "http-status-codes";
import { NextFunction, Request, Response } from "express";
import Category from "@models/categoryModel";
import SubCategory from "@models/subCategoryModel";
import { logger } from "@shared/logger";
import Cloudinary from "@shared/cloudinary";

const create = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  const { categoryId, title, subcategoryImageUrl } = req.body;
  let error, category, subCategory;

  if (!categoryId || !title || !subcategoryImageUrl)
    return next(createError(StatusCodes.BAD_REQUEST, "Subcategory Title and Image is required"));

  [error, category] = await to(Category.findById(categoryId));
  if (error) return next(error);
  if (!category) return next(createError(StatusCodes.NOT_FOUND, "Category not found!"));

  [error, subCategory] = await to(SubCategory.create({ title, subCategoryImage: subcategoryImageUrl }));
  if (error) return next(error);

  category.subCategories.push(subCategory._id as Types.ObjectId);
  [error] = await to(category.save());
  if (error) return next;

  return res.status(StatusCodes.CREATED).json({
    success: true,
    message: "Success",
    data: subCategory,
  });
};

const get = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  const id = req.params.id;
  const [error, subCategory] = await to(SubCategory.findById(id).lean());

  if (error) return next(error);
  if (!subCategory) return next(createError(StatusCodes.NOT_FOUND, "SubCategory not found!"));
  return res.status(StatusCodes.OK).json({ success: true, message: "Success", data: subCategory });
};

const getAll = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;

  const [error, subCategories] = await to(
    SubCategory.aggregate([
      {
        $lookup: {
          from: "categories",
          localField: "_id",
          foreignField: "subCategories",
          as: "category",
        },
      },
      {
        $unwind: {
          path: "$category",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          title: 1,
          subCategoryImage: 1,
          categoryTitle: "$category.title",
        },
      },
      { $skip: skip },
      { $limit: limit },
    ])
  );

  if (error) {
    return next(error);
  }

  const [countError, totalCount] = await to(SubCategory.countDocuments());
  if (countError) {
    return next(countError);
  }
  const totalPages = Math.ceil(totalCount / limit);
  res.status(200).json({
    success: true,
    message: "Success",
    data: { subCategories, totalCount, page, totalPages, limit },
  });
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
        select: "title cover date map",
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

  const totalEvents = subCategory.events.length;
  const totalPages = Math.ceil(totalEvents / limit);

  return res.status(StatusCodes.OK).json({
    success: true,
    message: "Success",
    data: { subCategory, total: totalEvents, totalPages, page, limit },
  });
};

const update = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  const id = req.params.id;
  const { title, subcategoryImageUrl } = req.body;

  if (!title && !subcategoryImageUrl) {
    return next(createError(StatusCodes.BAD_REQUEST, "Nothing to update"));
  }

  let error, subCategory;
  [error, subCategory] = await to(SubCategory.findById(id));
  if (error) return next(error);
  if (!subCategory) return next(createError(StatusCodes.NOT_FOUND, "SubCategory not found"));

  if (subcategoryImageUrl) {
    // await Cloudinary.remove(subCategory.subCategoryImage);
    subCategory.subCategoryImage = subcategoryImageUrl;
  }

  subCategory.title = title || subCategory.title;
  [error] = await to(subCategory.save());
  if (error) return next(error);

  return res.status(StatusCodes.OK).json({
    success: true,
    message: "Success",
    data: subCategory,
  });
};

const remove = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  const id = req.params.id;
  let error, subCategory;

  [error, subCategory] = await to(SubCategory.findById(id));
  if (error) return next(error);
  if (!subCategory) return next(createError(StatusCodes.NOT_FOUND, "SubCategory not found"));

  if (subCategory.subCategoryImage) {
    // await Cloudinary.remove(subCategory.subCategoryImage);
  }

  [error] = await to(SubCategory.findByIdAndDelete(id));
  if (error) return next(error);

  const category = await Category.findOneAndUpdate(
    { subCategories: id },
    { $pull: { subCategories: id } },
    { new: true }
  );
  if (!category) return next(createError(StatusCodes.NOT_FOUND, "Category Not Found"));
  return res.status(StatusCodes.OK).json({ success: true, message: "Success", data: {} });
};

const SubCategoryController = {
  create,
  getAll,
  get,
  update,
  remove,
  getEvents,
};

export default SubCategoryController;
