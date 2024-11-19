import to from "await-to-ts";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import "dotenv/config";
import Auth, { AuthDocument } from "@models/authModel";
import sendEmail from "@utils/sendEmail";
import generateOTP from "@utils/generateOTP";
import handleError from "@utils/handleError";

type AuthPayload = {
  email: string;
  password: string;
  repeatPassword?: string;
};

type VerifyEmailPayload = {
  email: string;
  verificationOTP: string;
};

type PasswordPayload = {
  password: string;
  repeatPassword: string;
};

const register = async (
  req: Request<{}, {}, AuthPayload>,
  res: Response
): Promise<any> => {
  const { email, password } = req.body;

  let [error, auth] = await to(Auth.findOne({ email }));
  if (error) return handleError(error, res);
  if (auth) return res.status(400).json({ error: "Email already exists" });

  const verificationOTP = generateOTP();
  const verificationOTPExpire = new Date(Date.now() + 1 * 60 * 1000);

  const hashedPassword = await bcrypt.hash(password, 10);

  [error, auth] = await to(
    Auth.create({
      email,
      password: hashedPassword,
      verificationOTP,
      verificationOTPExpire,
    })
  );
  if (error) return handleError(error, res);

  sendEmail(email, verificationOTP);

  return res
    .status(201)
    .json({ message: "Registration Successful. Verify your email." });
};

const verifyEmail = async (
  payload: VerifyEmailPayload
): Promise<[Error | null, AuthDocument | null]> => {
  const { email, verificationOTP } = payload;
  let [error, auth] = await to(Auth.findOne({ email }));
  if (error) return [error, null];
  if (!auth) {
    error = new Error("Email don't exist");
    error.name = "NotFoundError";
    return [error, null];
  }
  if (auth && verificationOTP === auth.verificationOTP) return [null, auth];
  error = new Error("Wrong Verification Code");
  error.name = "UnauthorizedError";
  return [error, null];
};

const activate = async (
  req: Request<{}, {}, VerifyEmailPayload>,
  res: Response
): Promise<any> => {
  let [error, auth] = await verifyEmail(req.body);
  if (error) return handleError(error, res);

  if (auth) {
    auth.verificationOTP = "";
    auth.verificationOTPExpire = null;
    auth.isVerified = true;
    await auth.save();
    return res.status(200).json({ message: "Verification Successful" });
  }
};

const generateToken = (id: string): string => {
  return jwt.sign({ id }, process.env.JWT_SECRET!, { expiresIn: "96h" });
};

const login = async (
  req: Request<{}, {}, AuthPayload>,
  res: Response
): Promise<any> => {
  const { email, password } = req.body;
  const [error, auth] = await to(Auth.findOne({ email }));
  if (error) return handleError(error, res);
  if (!auth) return res.status(404).json({ error: "Email don't exist" });

  const isPasswordValid = bcrypt.compare(password, auth.password);
  if (!isPasswordValid)
    return res.status(401).json({ error: "Wrong password" });

  if (!auth.isVerified)
    return res.status(401).json({ error: "Verify your email first" });

  const token = generateToken(auth._id!.toString());

  return res.status(200).json({ message: "Login Successful", token: token });
};

// const forgotPassword = async (req: Request, res: Response) : Promise<any> {

// }

const AuthController = {
  register,
  activate,
  login,
};

export default AuthController;
