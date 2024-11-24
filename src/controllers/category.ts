import to from "await-to-ts";
import { Request, Response } from "express";
import handleError from "@utils/handleError";
import Category from "@models/category";

type CategoryPayload = {
  title: string;
};

type Params = {
  id: string;
};

const create = async (
  req: Request<{}, {}, CategoryPayload>,
  res: Response
): Promise<any> => {
  const title = req.body.title;
  const [error, category] = await to(Category.create({ title }));
  if (error) return handleError(error, res);
  return res.status(201).json({
    message: "Category created.",
    data: category,
  });
};

const getAll = async (req: Request, res: Response): Promise<any> => {
  const [error, categories] = await to(
    Category.find()
      .populate({ path: "subCategories", select: "title" })
      .select("title subCategories")
  );
  if (error) return handleError(error, res);
  return res.status(200).json({
    message: "Successfully fetched all categories",
    data: categories,
  });
};

const getById = async (req: Request<Params>, res: Response): Promise<any> => {
  const id = req.params.id;
  const [error, category] = await to(
    Category.findById(id).select("title subCategories").lean()
  );
  if (error) return handleError(error, res);
  return res.status(200).json({
    message: "Successfully fetched the category",
    data: category,
  });
};

const update = async (
  req: Request<Params, {}, CategoryPayload>,
  res: Response
): Promise<any> => {
  const id = req.params.id;
  const title = req.body.title;
  const [error, category] = await to(
    Category.findOneAndUpdate(
      { _id: id },
      { $set: { title: title } },
      { new: true }
    )
  );
  if (error) return handleError(error, res);
  if (!category) return res.status(404).json({ error: "Category not found!" });
  return res.status(200).json({
    message: "Category changed successfully",
    data: category,
  });
};

const remove = async (req: Request<Params>, res: Response): Promise<any> => {
  const id = req.params.id;
  const [error, category] = await to(Category.findOneAndDelete({ _id: id }));
  if (error) return handleError(error, res);
  if (!category) return res.status(404).json({ error: "Category not found!" });
  return res.status(200).json({
    message: "Category deleted successfully!",
  });
};

const getAllSubCategories = async (
  req: Request<Params>,
  res: Response
): Promise<any> => {
  const id = req.params.id;
  const [error, subCategories] = await to(
    Category.findById(id)
      .populate({ path: "subCategories", select: "title" })
      .select("subCategories")
      .lean()
  );
  if (error) return handleError(error, res);
  return res.status(200).json({
    data: subCategories,
  });
};

// const getAllPodcasts = async (
//   req: Request<Params>,
//   res: Response
// ): Promise<any> => {
//   const id = req.params.id;
//   const [error, podcasts] = await to(
//     Category.findById(id).populate("podcasts").lean()
//   );
//   if (error) return handleError(error, res);
//   return res.status(200).json({
//     data: podcasts,
//   });
// };

const CategoryController = {
  create,
  getAll,
  getById,
  update,
  remove,
  getAllSubCategories,
  // getAllPodcasts,
};

export default CategoryController;
