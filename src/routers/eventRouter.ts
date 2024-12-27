import EventController from "@controllers/eventController";
import { handleFileUpload } from "@middlewares/uploadFile";
import express from "express";

const router = express.Router();
router.post("/create", handleFileUpload, EventController.create);
router.get("/:id", EventController.get);
router.get("/", EventController.getAll);

// router.put("/update", EventController.update);
router.delete("/delete/:id", EventController.remove);

export default router;
