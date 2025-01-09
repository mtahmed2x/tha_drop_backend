import { Request, Response, NextFunction } from "express";
import to from "await-to-ts";
import Bookmark from "@models/bookmarkModel";
import { StatusCodes } from "http-status-codes";

const toggle = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  const userId = req.user.userId;
  const eventId = req.body.eventId;

  let error, bookmark;

  [error, bookmark] = await to(Bookmark.findOne({ user: userId }));
  if (error) return next(error);

  if (bookmark) {
    const isBookMarked = bookmark.event.includes(eventId);
    if (isBookMarked) {
      bookmark.event = bookmark.event.filter((id) => id.toString() !== eventId);
    } else {
      bookmark.event.push(eventId);
    }

    await bookmark.save();

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
  let error, bookmark;
  [error, bookmark] = await to(Bookmark.findOne({ user: userId }));
  if (error) return next(error);
  if (!bookmark) return res.status(StatusCodes.OK).json({ success: true, message: "No bookmark found", data: {} });
  return res.status(StatusCodes.OK).json({ success: true, message: "Success", data: bookmark });
};

const BookmarkController = {
  toggle,
  get,
};

export default BookmarkController;
