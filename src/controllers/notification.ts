import Notification, { NotificationDocument } from "@models/notification";
import { Types } from "mongoose";
import Podcast from "@models/podcast";
import User from "@models/user";

const setNotificationMessage = async (
  notification: NotificationDocument,
  length: number,
  title: string
) => {
  let message;
  if (length === 1) {
    let user = await User.findById(notification.users[0]);
    message = `${user!.name} liked your podcast ${title}`;
  } else if (length === 2) {
    let user1 = await User.findById(notification.users[0]);
    let user2 = await User.findById(notification.users[1]);
    message = `${user1!.name} and ${user2!.name} liked your podcast ${title}`;
  } else {
    let user1 = await User.findById(notification.users[0]);
    let user2 = await User.findById(notification.users[1]);
    message = `${user1!.name}, ${user2!.name} and ${
      length - 2
    } others liked your podcast ${title}`;
  }
  return message;
};

export const addLikeNotification = async (id: string, userId: string) => {
  const podcast = await Podcast.findById(id);

  let notification = await Notification.findOne({
    subject: "like",
    podcast: id,
  });
  if (!notification) {
    notification = await Notification.create({
      subject: "like",
      users: userId,
      podcast: id,
      creator: podcast!.creator,
    });
  } else {
    if (!notification.users.includes(new Types.ObjectId(userId))) {
      notification.users.push(new Types.ObjectId(userId));
    }
  }
  notification.message = await setNotificationMessage(
    notification,
    notification.users.length,
    podcast!.title
  );
  await notification.save();
  console.log(notification);
};

export const removeLikeNotification = async (id: string, userId: string) => {
  const podcast = await Podcast.findById(id);
  let notification = await Notification.findOne({
    subject: "like",
    podcast: id,
  });
  const notificationId = notification!._id;
  if (notification!.users.length === 1) {
    await Notification.findByIdAndDelete(notificationId);
  } else {
    notification = await Notification.findByIdAndUpdate(
      notificationId,
      { $pull: { users: userId } },
      { new: true }
    );
    notification!.message = await setNotificationMessage(
      notification!,
      notification!.users.length,
      podcast!.title
    );
    await notification!.save();
    console.log(notification);
  }
};
