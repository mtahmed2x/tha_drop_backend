import AuthController from "@controllers/authController";
import express from "express";
const authRouter = express.Router();

authRouter.post("/register", AuthController.register);
authRouter.post("/activate", AuthController.activate);

export default authRouter;
