import express from "express";
import BookmarkController from "@controllers/bookmarkController";
import { authorize } from "@middlewares/authorization";

const router = express.Router();

router.post("/toggle", authorize, BookmarkController.toggle);
router.get("/", authorize, BookmarkController.get);

export default router;
