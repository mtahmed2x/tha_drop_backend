import AuthController from "@controllers/auth";
import express from "express";
import { authorize } from "@middlewares/authorization";

const authRouter = express.Router();

authRouter.post("/register", AuthController.register);
authRouter.post("/activate", AuthController.activate);
authRouter.post("/login", AuthController.login);
authRouter.post("/forgot-password", AuthController.forgotPassword);
authRouter.post("/recover-password", AuthController.recoverPassword);
authRouter.post("/change-password", authorize, AuthController.changePassword);

export default authRouter;
