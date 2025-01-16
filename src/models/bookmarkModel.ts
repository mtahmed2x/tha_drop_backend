import { BookmarkSchema } from "@schemas/bookmarkSchema";
import { model, Schema } from "mongoose";

const bookMarkSchema = new Schema<BookmarkSchema>({
  user: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  event: {
    type: [Schema.Types.ObjectId],
    ref: "Event",
    required: true,
  },
});

const Bookmark = model<BookmarkSchema>("Bookmark", bookMarkSchema);
export default Bookmark;
