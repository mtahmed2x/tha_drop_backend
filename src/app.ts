import express from "express";
import cors from "cors";
import authRouter from "@routers/auth";
import CategoryRouter from "@routers/category";
import SubCategoryRouter from "@routers/subCategory";
import PodcastRouter from "@routers/podcast";
import PlanRouter from "@routers/plan";
import UserRouter from "@routers/user";
import CreatorRouter from "@routers/creator";
import SubScriptionRouter from "@routers/subscription";

const app = express();

app.use(express.json());
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);
app.use("/auth", authRouter);
app.use("/category", CategoryRouter);
app.use("/sub-category", SubCategoryRouter);
app.use("/podcast", PodcastRouter);
app.use("/plan", PlanRouter);
app.use("subscription", SubScriptionRouter);
app.use("/user", UserRouter);
app.use("/creator", CreatorRouter);

export default app;
