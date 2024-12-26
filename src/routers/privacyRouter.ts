import express from "express";
import PrivacyController from "@controllers/privacyControllers";
import { authorize, isAdmin } from "@middlewares/authorization";

const router = express.Router();

router.post("/create", PrivacyController.create);
router.get("/", PrivacyController.get);
router.put("/update/:id", PrivacyController.update);

export default router;
