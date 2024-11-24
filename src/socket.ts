import { decode } from "@middlewares/authorization";
import { addOrRemoveLike } from "@events/like";
import { addNewComment } from "@events/comment";
import { updateLikeCount, updateCommentCount } from "@controllers/podcast";
import {
  addLikeNotification,
  removeLikeNotification,
} from "@controllers/notification";
import { Server, Socket } from "socket.io";
import dotenv from "dotenv";

dotenv.config();

let io: Server | undefined;

interface LikePodcastData {
  podcastId: string;
}
interface CommentPodcastData {
  podcastId: string;
  text: string;
}

export const initSocket = (server: any): void => {
  io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.use(async (socket: Socket, next) => {
    const token = socket.handshake.headers.access_token as string | undefined;
    console.log(token);
    if (!token) return next(new Error("Authentication error: No token found"));
    const [error, user] = await decode(token);
    console.log(user);
    if (error) return next(new Error(error.message));
    socket.data.user = user;
    next();
  });

  io.on("connection", (socket: Socket) => {
    const user = socket.data.user;
    console.log("User authenticated and connected:", user.authId);

    socket.on("likePodcast", async (data: LikePodcastData) => {
      const value = await addOrRemoveLike(data.podcastId, user.userId);
      const toalLikes = await updateLikeCount(data.podcastId, value);
      if (value == 1) addLikeNotification(data.podcastId, user.userId);
      if (value == -1) removeLikeNotification(data.podcastId, user.userId);
      io!.emit("likeUpdate", { totalLikes: toalLikes });
    });

    socket.on("commentPodcast", async (data: CommentPodcastData) => {
      const comment = await addNewComment(
        data.podcastId,
        data.text,
        user.userId
      );
      console.log(comment);
      await updateCommentCount(data.podcastId);
      io!.emit("commentUpdate", { user: user.userId, comment: comment.text });
    });

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
