import express from "express";
import EventController from "@controllers/eventController";
import { authorize, isAdmin } from "@middlewares/authorization";

import fileUpload from "express-fileupload";
import fileHandler from "@middlewares/fileHandler";

const EventRouter = express.Router();

EventRouter.post("/create", fileUpload(), fileHandler, EventController.create);
EventRouter.get("/", EventController.getAll);
// CategoryRouter.get("/:id", authorize, CategoryController.get);
// CategoryRouter.put("/update/:id", authorize, isAdmin, handleFileUpload, CategoryController.update);
// CategoryRouter.delete("/delete/:id", authorize, isAdmin, CategoryController.remove);
// CategoryRouter.get("/:id/sub-categories", authorize, CategoryController.getSubCategories);

export default EventRouter;
