import Like from "@models/like";

export const addOrRemoveLike = async (
  id: string,
  userId: string
): Promise<number> => {
  let like = await Like.findOne({ podcast: id, user: userId });
  if (like) {
    await Like.deleteOne({ podcast: id, user: userId });
    return -1;
  } else {
    await Like.create({ podcast: id, user: userId });
    return 1;
  }
};
