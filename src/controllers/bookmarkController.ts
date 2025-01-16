import { Request, Response, NextFunction } from "express";
import to from "await-to-ts";
import Bookmark from "@models/bookmarkModel";
import { StatusCodes } from "http-status-codes";
import createError from "http-errors";

const toggle = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  const userId = req.user.userId;
  const eventId = req.body.eventId;
  if (!userId || !eventId) {
    return next(createError(StatusCodes.BAD_REQUEST, "Missing eventId or userId"));
  }

  let error, bookmark;

  [error, bookmark] = await to(Bookmark.findOne({ user: userId }));
  if (error) return next(error);
  console.log(bookmark);

  if (bookmark) {
    const isBookMarked = bookmark.event.includes(eventId);
    console.log(eventId, isBookMarked);

    if (isBookMarked) {
      console.log(bookmark.event);
      bookmark = await Bookmark.findByIdAndUpdate(bookmark._id, { $pull: { event: eventId } }, { new: true });
    } else {
      bookmark.event.push(eventId);
      await bookmark.save();
    }

    return res.status(StatusCodes.OK).json({
      success: true,
      message: isBookMarked ? "Event removed from bookmarks" : "Event added to bookmarks",
      bookmarks: bookmark,
    });
  } else {
    [error, bookmark] = await to(Bookmark.create({ user: userId, event: [eventId] }));
    if (error) return next(error);

    return res.status(201).json({
      success: true,
      message: "Event added to bookmarks",
      bookmarks: bookmark,
    });
  }
};

const get = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  const userId = req.user.userId;
  let error, bookmarks;
  [error, bookmarks] = await to(
    Bookmark.findOne({ user: userId }).populate({ path: "event", select: "title cover _id map" })
  );
  console.log(bookmarks);

  if (error) return next(error);
  if (!bookmarks)
    return res.status(StatusCodes.OK).json({ success: true, message: "No bookmark found", data: { bookmarks: [] } });
  return res.status(StatusCodes.OK).json({ success: true, message: "Success", data: bookmarks });
};

const BookmarkController = {
  toggle,
  get,
};

export default BookmarkController;
