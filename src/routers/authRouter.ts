import AuthController from "@controllers/authController";
import express from "express";
import { authorize, recoveryAuthorize } from "@middlewares/authorization";

const authRouter = express.Router();

authRouter.post("/register", AuthController.register);
authRouter.post("/activate", AuthController.activate);
authRouter.post("/login", AuthController.login);
authRouter.post("/forgot-password", AuthController.forgotPassword);
authRouter.post("/recovery-verification", AuthController.recoveryVerification);
authRouter.put("/reset-password", recoveryAuthorize, AuthController.resetPassword);
authRouter.put("/change-password", authorize, AuthController.changePassword);
authRouter.delete("/delete", authorize, AuthController.remove);
authRouter.get("/access-token", authorize, AuthController.getAccessToken);

export default authRouter;