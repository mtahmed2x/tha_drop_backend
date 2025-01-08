import express from "express";
import ReviewController from "@controllers/reviewController";

const router = express.Router();

router.post("/create", ReviewController.create);
router.put("/update/:id", ReviewController.update);

export default router;
