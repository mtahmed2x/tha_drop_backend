import Faq from "@models/faqModel";
import to from "await-to-ts";
import { NextFunction, Request, Response } from "express";
import createError from "http-errors";
import { StatusCodes } from "http-status-codes";

const create = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  const { question, answer } = req.body;
  const [error, faq] = await to(Faq.create({ question, answer }));
  if (error) return next(error);
  res.status(StatusCodes.CREATED).json({ success: true, message: "Success", data: faq });
};

const getAll = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  const [error, faqs] = await to(Faq.find());
  if (error) return next(error);
  if (!faqs) return next(createError(404, "Faqs Not Found"));
  return res.status(StatusCodes.OK).json({ success: true, message: "Success", data: faqs });
};

const update = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  const id = req.params.id;
  const { question, answer } = req.body;
  let updateFields: { question?: string | null; answer?: string | null } = {};
  if (question) updateFields.question = question;
  if (answer) updateFields.answer = answer;
  const [error, faq] = await to(Faq.findByIdAndUpdate(id, { $set: updateFields }, { new: true }));
  if (error) return next(error);
  if (!faq) return next(createError(404, "Faq Not Found"));
  res.status(StatusCodes.OK).json({ success: true, message: "Success", data: faq });
};

const remove = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  const id = req.params.id;
  const [error, faq] = await to(Faq.findByIdAndDelete(id));
  if (error) return next(error);
  if (!faq) return next(createError(404, "Faq Not Found"));
  res.status(StatusCodes.OK).json({ success: true, message: "Success", data: {} });
};

const FaqController = {
  create,
  getAll,
  update,
  remove,
};
export default FaqController;
