import to from "await-to-ts";
import e, { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import Event from "@models/eventModel";
import Stripe from "stripe";
import createError from "http-errors";
import Cloudinary from "@shared/cloudinary";
import SubCategory from "@models/subCategoryModel";
import { Types } from "mongoose";
import TimeUtils from "@utils/tileUtils";
import Bookmark from "@models/bookmarkModel";
import { EventSchema } from "@schemas/eventSchemas";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const create = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  const userId = req.user.userId;
  const {
    title,
    organizer,
    categoryId,
    subCategoryId,
    date,
    description,
    coverUrl,
    galleryUrls,
    deadline,
    location,
    latitude,
    longitude,
  } = req.body;
  const ticketPrice = parseInt(req.body.ticketPrice);
  const availableTickets = parseInt(req.body.availableTickets);

  let error, product, price, event, subCategory;
  [error, product] = await to(
    stripe.products.create({
      name: title,
      description: description,
    })
  );
  if (error) return next(error);

  [error, price] = await to(
    stripe.prices.create({
      product: product.id,
      unit_amount: ticketPrice,
      currency: "usd",
    })
  );
  if (error) return next(error);

  [error, subCategory] = await to(SubCategory.findById(subCategoryId));
  if (error) return next(error);
  if (!subCategory) return next(createError(StatusCodes.NOT_FOUND, "Subcategory not found"));

  [error, event] = await to(
    Event.create({
      title,
      organizer,
      host: userId,
      category: categoryId,
      subCategory: subCategoryId,
      date,
      description,
      cover: coverUrl,
      gallery: galleryUrls,
      ticketPrice,
      productId: product.id,
      ticketPriceId: price.id,
      deadline,
      availableTickets,
      map: {
        location,
        latitude: Number.parseFloat(latitude),
        longitude: Number.parseFloat(longitude),
      },
    })
  );
  if (error) return next(error);

  subCategory.events.push(event._id as Types.ObjectId);
  [error] = await to(subCategory.save());
  if (error) return next(error);

  return res.status(StatusCodes.CREATED).json({ success: true, message: "Success", data: event });
};

const get = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  const userId = req.user.userId;
  const id = req.params.id;
  const [error, event] = await to(
    Event.findById(id)
      .populate({ path: "host", select: "name" })
      .populate({ path: "category", select: "title" })
      .populate({ path: "subCategory", select: "title" })
      .lean()
  );
  if (error) return next(error);
  if (!event) return next(createError(StatusCodes.NOT_FOUND, "Event Not Found"));

  let isBookmarked = false;
  const bookmark = await Bookmark.findOne({ user: userId });
  if (bookmark) {
    isBookmarked = bookmark.event.includes(new Types.ObjectId(id));
  }
  return res.status(StatusCodes.OK).json({ success: true, message: "Success", data: { event, isBookmarked } });
};

const getAll = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const [error, events] = await to(
    Event.find()
      .populate({ path: "host", select: "name" })
      .populate({ path: "category", select: "title" })
      .populate({ path: "subCategory", select: "title" })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean()
  );
  if (error) return next(error);
  if (!events) return next(createError(StatusCodes.NOT_FOUND, "Event Not Found"));
  return res.status(StatusCodes.OK).json({ success: true, message: "Success", data: events });
};

type GalleryURL = string[];

const update = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  const id = req.params.id;
  const { title, organizer, description, coverUrl, currentGalleryUrls, galleryUrls, availableTickets, deadline } =
    req.body;

  let error, event: EventSchema | null;
  [error, event] = await to(Event.findById(id));
  if (error) return next(error);
  if (!event) return next(createError(StatusCodes.NOT_FOUND, "Event Not Found"));

  console.log(event);

  if (title || description) {
    event.title = title || event.title;
    event.description = description || event.description;

    [error] = await to(stripe.products.update(event.productId, { name: title, description: description }));
    if (error) return next(error);
  }

  event.organizer = organizer || event.organizer;
  event.deadline = deadline || event.deadline;
  event.availableTickets = availableTickets || event.availableTickets;
  event.gallery = currentGalleryUrls;

  if (coverUrl) {
    if (event.cover !== null && event.cover !== "") {
      await Cloudinary.remove(event.cover);
    }
    event.cover = coverUrl;
  }

  if (currentGalleryUrls) {
    event.gallery = currentGalleryUrls;
  } else {
    event.gallery = [];
  }
  if (galleryUrls) {
    (galleryUrls as GalleryURL).forEach((gallery) => {
      event?.gallery?.push(gallery);
    });
  }

  [error, event] = await to(event.save());
  if (error) return next(error);

  return res.status(StatusCodes.OK).json({ success: true, message: "Success", data: event });
};

const remove = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  const id = req.params.id;
  const [error, event] = await to(Event.findByIdAndDelete(id));
  if (error) return next(error);
  if (!event) return next(createError(StatusCodes.NOT_FOUND, "Event Not Found"));
  return res.status(StatusCodes.OK).json({ success: true, message: "Success", data: {} });
};

const search = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  const searchTerm = req.query.q as string;
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;

  if (!searchTerm || searchTerm.trim() === "") {
    return next(createError(StatusCodes.BAD_REQUEST, "Search term is required"));
  }

  const regex = new RegExp(searchTerm, "i");

  const [error, events] = await to(
    Event.find({ title: { $regex: regex } })
      .populate({ path: "host", select: "name" })
      .populate({ path: "category", select: "title" })
      .populate({ path: "subCategory", select: "title" })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean()
  );

  if (error) return next(error);
  if (!events || events.length === 0) {
    return next(createError(StatusCodes.NOT_FOUND, "No events found matching the search term"));
  }

  return res.status(StatusCodes.OK).json({
    success: true,
    message: "Success",
    data: events,
  });
};

const EventController = {
  create,
  get,
  getAll,
  search,
  update,
  remove,
};

export default EventController;
