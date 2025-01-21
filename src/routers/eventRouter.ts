import express from "express";
import EventController from "@controllers/eventController";
import { authorize, isAdmin } from "@middlewares/authorization";

import fileUpload from "express-fileupload";
import fileHandler from "@middlewares/fileHandler";
import EventServices from "@services/eventServices";

const EventRouter = express.Router();
EventRouter.get("/search", authorize, EventController.search);
EventRouter.post("/buy-ticket", authorize, EventServices.buyTicket);
EventRouter.post("/create", fileUpload(), fileHandler, authorize, EventController.create);

EventRouter.get("/:id", authorize, EventController.get);
EventRouter.get("/", EventController.getAll);
EventRouter.put("/update/:id", fileUpload(), fileHandler, authorize, EventController.update);
EventRouter.delete("/delete/:id", authorize, EventController.remove);

export default EventRouter;
