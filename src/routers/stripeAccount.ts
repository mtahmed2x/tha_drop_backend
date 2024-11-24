import AccountController from "@controllers/stripeAccount";
import express from "express";

const router = express.Router();
router.post("/link", AccountController.linkAccount);

export default router;
