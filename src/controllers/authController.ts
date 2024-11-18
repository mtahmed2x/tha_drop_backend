import to from "await-to-ts";
import { Request, Response } from "express";
import Auth, { AuthDocument } from "@models/authModel";
import sendEmail from "@utils/sendEmail";
import generateOTP from "@utils/generateOTP";
import handleError from "@utils/handleError";

type Email = string;
type Password = string;
type VerificationOTP = string;
type VerificationOTPExpire = Date;

const register = async (req: Request, res: Response): Promise<any> => {
  const { email, password }: { email: Email; password: Password } = req.body;

  let [error, auth] = await to(Auth.findOne({ email }));
  if (error) return handleError(error, res);
  if (auth) return res.status(400).json({ error: "Email already exists" });

  const verificationOTP: VerificationOTP = generateOTP();
  const verificationOTPExpire: VerificationOTPExpire = new Date(
    Date.now() + 1 * 60 * 1000
  );

  [error, auth] = await to(
    Auth.create({ email, password, verificationOTP, verificationOTPExpire })
  );
  if (error) return handleError(error, res);
  sendEmail(email, verificationOTP);

  return res
    .status(201)
    .json({ message: "Registration Successful. Verify your email." });
};

type Payload = {
  email: Email;
  verificationOTP: VerificationOTP;
};

const verifyEmail = async (
  payload: Payload
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
  req: Request<{}, {}, Payload>,
  res: Response
): Promise<any> => {
  let [error, auth] = await verifyEmail(req.body);
  if (error) return handleError(error, res);

  if (auth) {
    auth.verificationOTP = "";
    auth.verificationOTPExpire = null;
    auth.isVerified = true;
    await auth?.save();
    return res.status(200).json({ message: "Verification Successful" });
  }
};

const AuthController = {
  register,
  activate,
};

export default AuthController;
