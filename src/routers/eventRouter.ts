import EventController from "@controllers/eventController";
import express from "express";

const router = express.Router();
router.post("/create", EventController.create);
router.get("/", EventController.getAll);
router.get("/:id", EventController.get);
router.put("/update", EventController.update);
router.delete("/delete/:id", EventController.remove);

export default router;
