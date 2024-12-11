import to from "await-to-ts";
import createError from "http-errors";
import Category from "@models/categoryModel";
import { StatusCodes } from "http-status-codes";
import { NextFunction, Request, Response } from "express";

const create = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const title = req.body.title;
    const [error, category] = await to(Category.create({ title }));
    if (error) return next(error);
    return res.status(StatusCodes.CREATED).json({ success: true, message: "Success", data: category });
};

const get = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const id = req.params.id;
    const [error, category] = await to(Category.findById(id).select("title subCategories").lean());
    if (error) return next(error);
    if (!category) return next(createError(StatusCodes.NOT_FOUND, "Category Not Found"));
    return res.status(StatusCodes.OK).json({ success: true, message: "Success", data: category });
};

const getAll = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const [error, categories] = await to(
        Category.find()
            .populate({
                path: "subCategories",
                select: "title"
            })
            .select("title subCategories")
            .skip((page - 1) * limit)
            .limit(limit)
            .lean()
    );
    if (error) return next(error);
    if (!categories) return next(createError(StatusCodes.NOT_FOUND, "No categories found"));
    return res.status(StatusCodes.OK).json({ success: true, message: "Success", data: categories });
};

const update = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const id = req.params.id;
    const title = req.body.title;
    const [error, category] = await to(Category.findOneAndUpdate({ _id: id }, { $set: { title: title } }, { new: true }));
    if (error) return next(error);
    if (!category) return next(createError(StatusCodes.NOT_FOUND, "Category Not Found"));
    return res.status(StatusCodes.OK).json({ success: true, message: "Success", data: category });
};

const remove = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const id = req.params.id;
    const [error, category] = await to(Category.findOneAndDelete({ _id: id }));
    if (error) return next(error);
    if (!category) return next(createError(StatusCodes.NOT_FOUND, "Category Not Found"));
    return res.status(StatusCodes.OK).json({ success: true, message: "Success" });
};

const getSubCategories = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const id = req.params.id;
    const [error, subCategories] = await to(
        Category.findById(id).populate({ path: "subCategories", select: "title" }).select("subCategories").lean()
    );
    if (error) return next(error);
    if (!subCategories) return next(createError(StatusCodes.NOT_FOUND, "No SubCategories found"));
    return res.status(StatusCodes.OK).json({ data: subCategories });
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