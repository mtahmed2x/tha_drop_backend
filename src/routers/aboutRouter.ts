import express from "express";
import AboutController from "@controllers/aboutController";
import { authorize, isAdmin } from "@middlewares/authorization";
const router = express.Router();

router.post("/create", authorize, isAdmin, AboutController.create);
router.get("/", authorize, AboutController.get);
router.put("/update/:id", authorize, isAdmin, AboutController.update);

export default router;