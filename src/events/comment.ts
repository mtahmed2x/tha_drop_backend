import Comment, { CommentDocument } from "@models/comment";

export const addNewComment = async (
  id: string,
  text: string,
  userId: string
): Promise<CommentDocument> => {
  const comment = await Comment.create({
    user: userId,
    podcast: id,
    text: text,
  });
  console.log(comment);
  return comment;
};
