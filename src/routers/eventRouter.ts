import express from "express";
import EventController from "@controllers/eventController";
import { authorize, isAdmin } from "@middlewares/authorization";

import fileUpload from "express-fileupload";
import fileHandler from "@middlewares/fileHandler";

const EventRouter = express.Router();

EventRouter.post("/create", fileUpload(), fileHandler, authorize, EventController.create);
EventRouter.get("/", EventController.getAll);
EventRouter.get("/:id", EventController.get);
EventRouter.put("/update/:id", fileUpload(), fileHandler, authorize, EventController.update);
EventRouter.delete("/delete/:id", authorize, EventController.remove);

export default EventRouter;
