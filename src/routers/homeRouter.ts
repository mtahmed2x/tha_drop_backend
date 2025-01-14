import express from "express";
import HommeController from "@controllers/homeController";
const router = express.Router();

router.get("/", HommeController.home);

export default router;
