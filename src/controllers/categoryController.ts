import to from "await-to-ts";
import createError from "http-errors";
import Category from "@models/categoryModel";
import { StatusCodes } from "http-status-codes";
import { NextFunction, Request, Response } from "express";

const create = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const title = req.body.title;
    const categoryImage = (req as any).files.categoryImage[0].path;
    const [error, category] = await to(Category.create({ title, categoryImage }));
    if (error) return next(error);
    return res.status(StatusCodes.CREATED).json({ success: true, message: "Success", data: category });
};

const get = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const id = req.params.id;
    const [error, category] = await to(Category.findById(id).lean());
    if (error) return next(error);
    if (!category) return next(createError(StatusCodes.NOT_FOUND, "Category Not Found"));
    return res.status(StatusCodes.OK).json({ success: true, message: "Success", data: category });
};

const getAll = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [error, categories] = await to(Category.find().select("title catergoryImage").skip(skip).limit(limit).lean());
    if (error) return next(error);

    const total = categories.length;
    const totalPages = Math.ceil(total / limit); 
    
    if (!categories) return res.json({ success: true, message: "No Categories found", data: {categories: [], page, limit, total, totalPages}});
    return res.status(StatusCodes.OK).json({ success: true, message: "Success", data: {categories, page, limit, total, totalPages} });
};

const getSubCategories = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const id = req.params.id;
    const [error, categories] = await to(
        Category.findById(id).populate({ path: "subCategories", select: "title subCategoryImage" }).lean()
    );
    if (error) return next(error);
    if (!categories) return next(createError(StatusCodes.NOT_FOUND, "No SubCategories found"));
    return res.status(StatusCodes.OK).json({ data: categories });
};

const update = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const id = req.params.id;
    
    let error, category;
    [error, category] = await to(Category.findById(id));
    if (error) return next(error);
    if (!category) return next(createError(StatusCodes.NOT_FOUND, "Category Not Found"));

    const title = req.body.title;
    const categoryImage = (req as any).files.categoryImage[0].path;    
    if(!title && !categoryImage) {
        return next(createError(StatusCodes.BAD_REQUEST, "Nothing to update"));
    }

    const updatedFields = {
        title: title || category.title,
        categoryImage: categoryImage || category.categoryImage,
    };
    [error, category] = await to(Category.findOneAndUpdate({ _id: id }, { $set: updatedFields }, { new: true }));
    if (error) return next(error);
    
    return res.status(StatusCodes.OK).json({ success: true, message: "Success", data: category });
};

const remove = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const id = req.params.id;
    const [error, category] = await to(Category.findOneAndDelete({ _id: id }));
    if (error) return next(error);
    if (!category) return next(createError(StatusCodes.NOT_FOUND, "Category Not Found"));
    return res.status(StatusCodes.OK).json({ success: true, message: "Success", data: {} });
};

const CategoryController = {
    create,
    get,
    getAll,
    update,
    remove,
    getSubCategories
};

export default CategoryController;