import to from "await-to-ts";
import "dotenv/config";
import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { DecodedUser } from "@models/user";

import Auth from "@models/auth";
import User from "@models/user";
import handleError from "@utils/handleError";

type Decoded = {
  id: string;
};

export const decode = async (
  token: string
): Promise<[Error | null, DecodedUser | null]> => {
  let error, auth, user;

  let decoded: Decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET!) as Decoded;
  } catch (err) {
    return [err as Error, null];
  }

  [error, auth] = await to(
    Auth.findById(decoded.id).select("email role isVerified")
  );
  if (error) return [error, null];
  if (!auth) {
    error = new Error("Auth does not exist");
    error.name = "NotFoundError";
    return [error, null];
  }

  [error, user] = await to(User.findOne({ auth: auth._id }));
  if (error) return [error, null];
  if (!user) {
    error = new Error("User does not exist");
    error.name = "NotFoundError";
    return [error, null];
  }

  const data: DecodedUser = {
    authId: auth._id!.toString(),
    isVerified: auth.isVerified,
    isBlocked: auth.isBlocked,
    email: auth.email,
    role: auth.role,
    userId: user._id!.toString(),
    name: user.name,
  };

  return [null, data];
};

export const authorize = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer")) {
    return res.status(403).json({ error: "Not authorized, token missing" });
  }
  const token = authHeader.split(" ")[1];
  const [error, data] = await decode(token);
  if (error) return handleError(error, res);
  if (data) req.user = data;
  next();
};
