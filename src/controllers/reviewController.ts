import Review from "@models/reviewModel";
import to from "await-to-ts";

import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { userInfo } from "os";

const create = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  const { userId, targetId, star, comment } = req.body;
  const [error, review] = await to(Review.create({ user: userId, target: targetId, star, comment }));
  if (error) return next(error);
  return res.status(StatusCodes.CREATED).json({ success: true, message: "Success", data: review });
};

// const update = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
//   const id = req.params.id;
//   let error, review;
//   [error, review] = await to(Review.findById(id));
// };
