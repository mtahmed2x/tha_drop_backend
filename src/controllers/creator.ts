import Auth from "@models/auth";
import handleError from "@utils/handleError";
import to from "await-to-ts";
import { Request, Response } from "express";

const remove = async (req: Request, res: Response): Promise<any> => {
  const user = req.user;
  const [error] = await to(Auth.findOneAndDelete({ _id: user.authId }));
  if (error) handleError(error, res);
  res.status(200).json({ message: "Account successfully deleted" });
};

const CreatorController = {
  remove,
};

export default CreatorController;
