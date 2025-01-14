import express from "express";
import UserController from "@controllers/userController";
import { authorize, isAdmin } from "@middlewares/authorization";
import UserServices from "@services/userServices";
import fileUpload from "express-fileupload";
import fileHandler from "@middlewares/fileHandler";

const router = express.Router();

router.post("/link-account", authorize, UserServices.linkStripeAccount);
router.put("/update-schedule", authorize, UserServices.updateSchedule);
router.get("/my-schedule", authorize, UserServices.getMySchedules);
router.get("/my-tickets", authorize, UserServices.getMyTickets);
router.get("/my-guests", authorize, UserServices.getMyGuests);
router.get("/my-reviews", authorize, UserServices.getMyReviews);
router.get("/my-requests", authorize, UserServices.getMyRequests);
router.post("/approve/:id", authorize, isAdmin, UserController.approve);
router.post("/block/:id", authorize, isAdmin, UserController.block);
router.post("/unblock/:id", authorize, isAdmin, UserController.unblock);
router.get("/all", authorize, UserController.getAllUsers);
router.get("/info", authorize, UserController.get);
router.put("/update", fileUpload(), fileHandler, authorize, UserController.update);

export default router;
