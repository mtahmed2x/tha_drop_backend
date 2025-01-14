import express from "express";
import HiringService from "@services/hiringServices";
import { authorize } from "@middlewares/authorization";
const router = express.Router();

router.post("/hire", authorize, HiringService.hire);
router.post("/accept", authorize, HiringService.acceptRequest);
router.post("/reject", authorize, HiringService.rejectRequest);
router.get("/available", HiringService.getAvailableHire);

export default router;
