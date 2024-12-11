import to from "await-to-ts";
import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import Event from "@models/eventModel";
import Stripe from "stripe";
import createError from "http-errors";
import { EventSchema } from "@schemas/eventSchemas";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

type Files = Express.Request & {
    files: { [fieldname: string]: Express.Multer.File[] };
};

const create = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const { title, organizer, host, categoryId, subCategoryId, date, location, description, ticketPrice, deadline } =
        req.body;
    let error, cover, gallery, product, price, event;
    if ((req as Files).files) {
        cover = (req as Files).files.cover;
        gallery = (req as Files).files.gallery;
    }
    let galleryPath: string[] = [];
    gallery!.map((file) => {
        galleryPath.push(file.path);
    });

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
            categoryId,
            subCategoryId,
            date,
            location,
            description,
            ticketPrice,
            productId: product.id,
            ticketPriceId: price.id,
            deadline,
            cover: cover![0].path,
            gallery: galleryPath,
        })
    );
    if (error) return next(error);
    return res.status(StatusCodes.CREATED).json({ success: true, message: "Success", data: event });
};
const get = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const id = req.params.id;
    const [error, event] = await to(
        Event.findById(id)
            .populate({ path: "host", select: "-_id name" })
            .populate({ path: "categoryId", select: "-_id title" })
            .populate({ path: "subCategoryId", select: "-_id title" })
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
            .populate({ path: "categoryId", select: "-_id title" })
            .populate({ path: "subCategoryId", select: "-_id title" })
            .skip((page - 1) * limit)
            .limit(limit)
            .lean()
    );
    if (error) return next(error);
    if (!events) return next(createError(StatusCodes.NOT_FOUND, "Event Not Found"));
    return res.status(StatusCodes.OK).json({ success: true, message: "Success", data: event });
};
const update = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const id = req.params.id;
    const { title, organizer, host, categoryId, subCategoryId, date, location, description, ticketPrice, deadline } =
        req.body;
    let error, cover, gallery, product, price, event;

    if ((req as Files).files) {
        cover = (req as Files).files.cover;
        gallery = (req as Files).files.gallery;
    }

    [error, event] = await to(Event.findById(id));
    if (error) return next(error);
    if (!event) return next(createError(StatusCodes.NOT_FOUND, "Event Not Found"));

    let updateFields: Partial<EventSchema> = {};

    if (title || description) {
        if (title) updateFields.title = title;
        if (description) updateFields.description = description;

        [error] = await to(stripe.products.update(event.productId, updateFields));
        if (error) return next(error);
    }

    if (organizer) updateFields.organizer = organizer;
    if (host) updateFields.host = host;
    if (categoryId) updateFields.category = categoryId;
    if (subCategoryId) updateFields.subCategory = subCategoryId;
    if (date) updateFields.date = date;
    if (location) updateFields.location = location;
    if (deadline) updateFields.deadline = deadline;

    if (ticketPrice) {
        [error] = await to(
            stripe.prices.update(event.ticketPriceId, {
                active: false,
            })
        );
        if (error) return next(error);

        [error, price] = await to(
            stripe.prices.create({
                product: event.productId,
                unit_amount: ticketPrice,
                currency: "usd",
            })
        );
        if (error) return next(error);

        updateFields.ticketPrice = ticketPrice;
        updateFields.ticketPriceId = price.id;
    }

    if (cover) updateFields.cover = cover[0].path;

    let galleryPath: string[] = [];
    if (gallery) {
        gallery.map((file) => {
            galleryPath.push(file.path);
        });
        updateFields.gallery = galleryPath;
    }

    [error, event] = await to(Event.findByIdAndUpdate(id, { $set: updateFields }, { new: true }));
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
