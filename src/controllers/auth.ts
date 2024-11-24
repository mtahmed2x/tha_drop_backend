import to from "await-to-ts";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import "dotenv/config";
import Auth, { AuthDocument } from "@models/auth";
import User, { UserDocument } from "@models/user";
import Creator, { CreatorDocument } from "@models/creator";
import sendEmail from "@utils/sendEmail";
import generateOTP from "@utils/generateOTP";
import handleError from "@utils/handleError";

type AuthPayload = {
  email: string;
  password: string;
  confirmPassword?: string;
};

type UserPayload = {
  name: string;
  role: "admin" | "user" | "creator";
  dateOfBirth: string;
  address: string;
};

type VerifyEmailPayload = {
  email: string;
  verificationOTP: string;
};

type ForgotPasswordPayload = {
  email: string;
};

type ChangePasswordPayload = {
  password: string;
  confirmPassword?: string;
};

const register = async (
  req: Request<{}, {}, AuthPayload & UserPayload>,
  res: Response
): Promise<any> => {
  const { name, email, role, dateOfBirth, address, password, confirmPassword } =
    req.body;

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
      role,
      verificationOTP,
      verificationOTPExpire,
    })
  );
  if (error) return handleError(error, res);

  const [userError, user] = await to(
    User.create({
      auth: auth._id,
      name: name,
      dateOfBirth: dateOfBirth,
      address: address,
    })
  );
  if (userError) return handleError(userError, res);

  type ResponseData = [AuthDocument, UserDocument, CreatorDocument?];
  const responseData: ResponseData = [
    auth as AuthDocument,
    user as UserDocument,
  ];

  if (role === "creator") {
    const [creatorError, creator] = await to(
      Creator.create({
        auth: auth._id,
        user: auth._id,
      })
    );
    if (creatorError)
      return res.status(500).json({ error: creatorError.message });

    responseData.push(creator);
  }

  sendEmail(email, verificationOTP);

  return res.status(201).json({
    message: "Registration Successful. Verify your email.",
    data: responseData,
  });
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

  const isPasswordValid = await bcrypt.compare(password, auth.password);
  if (!isPasswordValid)
    return res.status(401).json({ error: "Wrong password" });

  if (!auth.isVerified)
    return res.status(401).json({ error: "Verify your email first" });

  const token = generateToken(auth._id!.toString());

  return res.status(200).json({ message: "Login Successful", token: token });
};

const forgotPassword = async (
  req: Request<{}, {}, ForgotPasswordPayload>,
  res: Response
): Promise<any> => {
  const { email } = req.body;
  const [error, auth] = await to(Auth.findOne({ email }));
  if (error) return handleError(error, res);
  if (!auth) return res.status(404).json({ error: "Auth not found" });
  const verificationOTP = generateOTP();
  auth.verificationOTP = verificationOTP;
  auth.verificationOTPExpire = new Date(Date.now() + 1 * 60 * 1000);
  await auth.save();
  sendEmail(email, verificationOTP);
  return res
    .status(200)
    .json({ message: "Verification Code sent. Check your mail" });
};

const recoverPassword = async (
  req: Request<{}, {}, VerifyEmailPayload>,
  res: Response
): Promise<any> => {
  const [error, auth] = await verifyEmail(req.body);
  if (error) return handleError(error, res);
  if (auth) {
    const token = generateToken(auth._id!.toString());
    res.status(200).json({ recoveryToken: token });
  }
};

const changePassword = async (
  req: Request<{}, {}, ChangePasswordPayload>,
  res: Response
): Promise<any> => {
  const { password, confirmPassword } = req.body;
  if (password !== confirmPassword)
    return res.status(400).json({ error: "Passwords don't match" });
  const user = req.user;
  const auth = await Auth.findById(user.authId!);
  if (auth) {
    auth!.password = await bcrypt.hash(password, 10);
    await auth.save();
  }
  return res.status(200).json({ message: "Password changed" });
};

const AuthController = {
  register,
  activate,
  login,
  forgotPassword,
  recoverPassword,
  changePassword,
};

export default AuthController;
