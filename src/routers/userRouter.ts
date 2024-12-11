import express from "express";
import UserController from "@controllers/userController";
import { authorize } from "@middlewares/authorization";

const router = express.Router();

router.get("/", authorize, UserController.getAll);
router.get("/:id", authorize, UserController.get);
router.put("/edit", authorize, UserController.update);
router.post("/block", UserController.block);

export default router;
