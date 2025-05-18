import About from "@models/aboutModel";
import to from "await-to-ts";
import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import createError from "http-errors";

const create = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  const text = req.body.text;
  const [error, about] = await to(About.create({ text: text }));
  if (error) return next(error);
  return res.status(StatusCodes.CREATED).json({ success: true, message: "Success", data: about });
};

const get = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  const [error, about] = await to(About.findOne().lean());
  if (error) return next(error);
  if (!about) return res.status(StatusCodes.OK).json({ success: true, message: "No about us found!", data: about });
  return res.status(StatusCodes.OK).json({ success: true, message: "Success", data: about });
};

const update = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  const id = req.params.id;
  const text = req.body.text;
  const [error, about] = await to(About.findByIdAndUpdate(id, { $set: { text: text } }, { new: true }));
  if (error) return next(error);
  if (!about) return next(createError(StatusCodes.NOT_FOUND, "About us not found"));
  return res.status(StatusCodes.OK).json({ success: true, message: "Success", data: about });
};

const AboutController = {
  create,
  get,
  update,
};

export default AboutController;
