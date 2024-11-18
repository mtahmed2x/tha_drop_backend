import express from "express";
import authRouter from "@routers/authRouters";

const app = express();
app.use(express.json());
app.use("/auth", authRouter);
app.get("/", (req, res) => {
  res.send(`Hello World`);
});

export default app;
