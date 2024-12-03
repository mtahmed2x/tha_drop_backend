import AccountController from "@controllers/stripeAccount";
import express from "express";

const router = express.Router();
router.post("/link", AccountController.linkAccount);
router.post("/login", AccountController.loginAccount);
router.post("/update", AccountController.updateSchedule);

export default router;
