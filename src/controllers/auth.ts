import to from "await-to-ts";
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import "dotenv/config";
import Auth, { AuthDocument } from "@models/auth";
import User, { UserDocument } from "@models/user";
import sendEmail from "@utils/sendEmail";
import generateOTP from "@utils/generateOTP";
import handleError from "@utils/handleError";
import Guest from "@models/guest";
import Host from "@models/host";
import Bartender from "@models/bartender";
import DJ from "@models/DJ";
import BottleGirl from "@models/bottleGirl";
import createHttpError from "http-errors";
import Stripe from "stripe";

type Register = Pick<
  AuthDocument & UserDocument,
  | "name"
  | "email"
  | "role"
  | "dateOfBirth"
  | "address"
  | "password"
  | "confirmPassword"
>;
type Activate = Pick<AuthDocument, "email" | "verificationOTP">;
type Login = Pick<AuthDocument, "email" | "password">;
type ForgotPassword = { email: string };
type ChangePassword = Pick<AuthDocument, "password" | "confirmPassword">;

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const roleModelMap = {
  GUEST: Guest,
  HOST: Host,
  DJ: DJ,
  BARTENDER: Bartender,
  BOTTLEGIRL: BottleGirl,
};

const register = async (
  req: Request<{}, {}, Register>,
  res: Response,
  next: NextFunction
): Promise<any> => {
  const { name, email, role, dateOfBirth, address, password, confirmPassword } =
    req.body;

  let error, auth, user;

  [error, auth] = await to(Auth.findOne({ email }));
  if (error) return next(error);
  if (auth) return next(createHttpError(400, "Email already exists"));

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
  if (error) return next(error);

  [error, user] = await to(
    User.create({
      auth: auth._id,
      name: name,
      dateOfBirth: dateOfBirth,
      address: address,
    })
  );
  if (error) return next(error);

  const account = await stripe.accounts.create({ type: "express" });

  const RoleModel = roleModelMap[role];
  let roleDoc;
  [error, roleDoc] = await to(
    RoleModel.create({
      auth: auth._id,
      user: user._id,
      stripeAccoundId: account.id,
    })
  );
  if (error) return next(error);

  sendEmail(email, verificationOTP);

  return res.status(201).json({
    message: "Registration Successful. Verify your email.",
    data: { auth, user, roleDoc, account },
  });
};

const verifyEmail = async (
  payload: Activate
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
  req: Request<{}, {}, Activate>,
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
  req: Request<{}, {}, Login>,
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
  req: Request<{}, {}, ForgotPassword>,
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
  req: Request<{}, {}, Activate>,
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
  req: Request<{}, {}, ChangePassword>,
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
