import express from "express";
import CategoryController from "@controllers/categoryController";
import { authorize, isAdmin } from "@middlewares/authorization";
import { handleFileUpload } from "@middlewares/uploadFile";

const CategoryRouter = express.Router();

CategoryRouter.post("/create", authorize, isAdmin, handleFileUpload, CategoryController.create);
CategoryRouter.get("/", authorize, CategoryController.getAll);
CategoryRouter.get("/:id", authorize, CategoryController.get);
CategoryRouter.put("/update/:id", authorize, isAdmin, handleFileUpload, CategoryController.update);
CategoryRouter.delete("/delete/:id", authorize, isAdmin, CategoryController.remove);
CategoryRouter.get("/:id/sub-categories", authorize, CategoryController.getSubCategories);

export default CategoryRouter;
