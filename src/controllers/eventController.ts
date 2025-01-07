import to from "await-to-ts";
import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import Event from "@models/eventModel";
import Stripe from "stripe";
import createError from "http-errors";
import Cloudinary from "@shared/cloudinary";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const create = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  const {
    title,
    organizer,
    host,
    category,
    subCategory,
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

  let error, product, price, event;
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

  [error, event] = await to(
    Event.create({
      title,
      organizer,
      host,
      category,
      subCategory,
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
        latitude: Number.parseInt(latitude),
        longitude: Number.parseInt(longitude),
      },
    })
  );
  if (error) return next(error);
  return res.status(StatusCodes.CREATED).json({ success: true, message: "Success", data: event });
};

const get = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  const id = req.params.id;
  const [error, event] = await to(
    Event.findById(id)
      .populate({ path: "host", select: "_id, name" })
      .populate({ path: "category", select: "-_id title" })
      .populate({ path: "subCategory", select: "-_id title" })
      .lean()
  );
  if (error) return next(error);
  if (!event) return next(createError(StatusCodes.NOT_FOUND, "Event Not Found"));
  return res.status(StatusCodes.OK).json({ success: true, message: "Success", data: event });
};

const getAll = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const [error, events] = await to(
    Event.find()
      .populate({ path: "host", select: "-_id name" })
      .populate({ path: "category", select: "-_id title" })
      .populate({ path: "subCategory", select: "-_id title" })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean()
  );
  if (error) return next(error);
  if (!events) return next(createError(StatusCodes.NOT_FOUND, "Event Not Found"));
  return res.status(StatusCodes.OK).json({ success: true, message: "Success", data: events });
};
const update = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  const id = req.params.id;
  let error, event;
  [error, event] = await to(Event.findById(id));
  if (error) return next(error);
  if (!event) return next(createError(StatusCodes.NOT_FOUND, "Event Not Found"));

  const { title, organizer, description, coverUrl, galleryUrls, prevGalleyUrls, deadline } = req.body;
  const availableTickets = parseInt(req.body.availableTickets);

  if (coverUrl) {
    Cloudinary.remove(event.cover);
    event.cover = coverUrl;
  }
  if (prevGalleyUrls) {
    event.gallery = prevGalleyUrls;
    if (galleryUrls) event.gallery?.push(...galleryUrls);
  }

  if (title || description) {
    event.title = title || event.title;
    event.description = description || event.description;

    [error] = await to(stripe.products.update(event.productId, { name: title, description: description }));
    if (error) return next(error);
  }

  event.organizer = organizer || event.organizer;
  event.deadline = deadline || event.deadline;
  event.availableTickets = availableTickets || event.availableTickets;

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

const EventController = {
  create,
  get,
  getAll,
  update,
  remove,
};

export default EventController;
