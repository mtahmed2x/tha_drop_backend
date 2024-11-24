import express from "express";
import cors from "cors";
import authRouter from "@routers/auth";
import { errorHandler } from "@utils/errorHandler";
import accountRouter from "@routers/stripeAccount";
import TicketRouter from "@routers/ticket";

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
app.use("/account", accountRouter);
app.use("/ticket", TicketRouter);

app.use(errorHandler);

export default app;
