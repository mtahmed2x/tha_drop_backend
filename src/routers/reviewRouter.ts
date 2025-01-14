import express from "express";
import ReviewController from "@controllers/reviewController";
import { authorize } from "@middlewares/authorization";

const router = express.Router();

router.post("/create", authorize, ReviewController.create);
router.put("/update/:id", ReviewController.update);

export default router;
