import express from "express";
import cors from "cors";
import authRouter from "@routers/authRouter";
import { errorHandler } from "@middlewares/errorHandler";
import accountRouter from "@routers/stripeAccount";
// import TicketRouter from "@routers/ticket";
import EventRouter from "@routers/eventRouter";
import { notFound } from "@middlewares/notfound";

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
// app.use("/ticket", TicketRouter);
app.use("/event", EventRouter);

app.use(notFound);
app.use(errorHandler);

export default app;
