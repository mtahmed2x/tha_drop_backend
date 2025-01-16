import express from "express";
import HommeController from "@controllers/homeController";
import { authorize } from "@middlewares/authorization";
const router = express.Router();

router.get("/", authorize, HommeController.home);

export default router;
