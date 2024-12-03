import { decode } from "@middlewares/authorization";
import { Server, Socket } from "socket.io";
import dotenv from "dotenv";


dotenv.config();

let io: Server | undefined;

let a = 9;

export const initSocket = (server: any): void => {
  io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.use(async (socket: Socket, next) => {
    next();
  });

  io.on("connection", (socket: Socket) => {
    socket.on("disconnect", () => {
      console.log("A user disconnected");
    });
  });
};

export const getIO = (): Server => {
  if (!io) {
    throw new Error("Socket.io not initialized");
  }
  return io;
};
