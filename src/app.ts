import express from "express";
import cors from "cors";
import AuthRouter from "@routers/authRouter";
import UserRouter from "@routers/userRouter";
import { errorHandler } from "@middlewares/errorHandler";
import accountRouter from "@routers/stripeAccount";
import EventRouter from "@routers/eventRouter";
import { notFound } from "@middlewares/notfound";
import CategoryRouter from "@routers/categoryRouter";
import SubCategoryRouter from "@routers/subCategoryRouter";
import FaqRouter from "@routers/faqRouter";
import TaCRouter from "@routers/tacRouter";
import PrivacyRouter from "@routers/privacyRouter";
import AboutRouter from "@routers/aboutRouter";

const app = express();

app.use(express.json());
app.use("/uploads", express.static("uploads"));
app.use("/assets", express.static("assets"));

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);
app.use("/user", UserRouter);
app.use("/auth", AuthRouter);
app.use("/account", accountRouter);
app.use("/event", EventRouter);
app.use("/category", CategoryRouter);
app.use("/subCategory", SubCategoryRouter);

app.use("/tac", TaCRouter);
app.use("/faq", FaqRouter);
app.use("/privacy", PrivacyRouter);
app.use("/about", AboutRouter);

app.use(notFound);
app.use(errorHandler);

export default app;
