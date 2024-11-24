import to from "await-to-ts";
import { Request, Response } from "express";
import handleError from "@utils/handleError";
import Category from "@models/category";
import SubCategory from "@models/subCategory";
import { Types } from "mongoose";

type SubCategoryPayload = {
  categoryId?: string;
  title: string;
};

type Params = {
  id: string;
};

const create = async (
  req: Request<{}, {}, SubCategoryPayload>,
  res: Response
): Promise<any> => {
  let error, category, subCategory;
  const { categoryId, title } = req.body;

  [error, category] = await to(Category.findById(categoryId));
  if (error) return handleError(error, res);
  if (!category) return res.status(404).json({ error: "Category not found!" });

  [error, subCategory] = await to(SubCategory.create({ title }));
  if (error) return handleError(error, res);

  category.subCategories.push(subCategory._id as Types.ObjectId);
  [error] = await to(category.save());
  if (error) return handleError(error, res);

  return res
    .status(201)
    .json({ message: "SubCategory created successfully", data: subCategory });
};

const getAll = async (req: Request, res: Response): Promise<any> => {
  const [error, subCategories] = await to(
    SubCategory.find().select("title").lean()
  );
  if (error) return handleError(error, res);
  return res.status(200).json({ SubCategories: subCategories });
};

const getById = async (req: Request<Params>, res: Response): Promise<any> => {
  const id = req.params.id;
  const [error, subCategory] = await to(
    SubCategory.findById(id).select("title").lean()
  );
  if (error) return handleError(error, res);
  if (!subCategory)
    return res.status(404).json({ error: "SubCategory not found!" });
  return res.status(200).json({ SubCategory: subCategory });
};

const update = async (
  req: Request<Params, {}, SubCategoryPayload>,
  res: Response
): Promise<any> => {
  const id = req.params.id;
  const title = req.body.title;
  const [error, subCategory] = await to(
    SubCategory.findOneAndUpdate(
      { _id: id },
      { $set: { title: title } },
      { new: true }
    )
  );
  if (error) return handleError(error, res);
  if (!subCategory)
    return res.status(404).json({ error: "SubCategory not found!" });
  return res.status(200).json({
    SubCategory: subCategory,
  });
};

const remove = async (req: Request<Params>, res: Response): Promise<any> => {
  const id = req.params.id;
  const [error, subCategory] = await to(SubCategory.findByIdAndDelete(id));
  if (error) return handleError(error, res);
  if (!subCategory)
    return res.status(404).json({ error: "SubCategory not found!" });
  const category = await Category.findOneAndUpdate(
    { subCategories: id },
    { $pull: { subCategories: id } },
    { new: true }
  );
  if (!category) return res.status(404).json({ error: "Category not found!" });
  return res.status(200).json({
    message: "SubCategory deleted successfully!",
  });
};

const getAllPodcasts = async (
  req: Request<Params>,
  res: Response
): Promise<any> => {
  const id = req.params.id;
  const [error, podcasts] = await to(
    SubCategory.findById(id).populate("podcasts")
  );
  if (error) return handleError(error, res);
  if (!podcasts)
    return res.status(404).json({ error: "SubCategory not found!" });
  return res.status(200).json({
    message: "Successfully fetched all podcasts of the SubCategory",
    data: podcasts,
  });
};

const SubCategoryController = {
  create,
  getAll,
  getById,
  update,
  remove,
  getAllPodcasts,
};

export default SubCategoryController;
