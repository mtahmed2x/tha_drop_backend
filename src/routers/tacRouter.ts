import express from "express";
import TaCController from "@controllers/tacControllers";
const router = express.Router();

router.post("/create", TaCController.create);
router.get("/", TaCController.get);
router.put("/update/:id", TaCController.update);

export default router;
