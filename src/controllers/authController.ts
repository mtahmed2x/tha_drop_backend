import to from "await-to-ts";
import { Request, Response } from "express";
import Auth from "@models/authModel";
import sendEmail from "@utils/sendEmail";
import generateOTP from "@utils/generateOTP";
import handleError from "@utils/handleError";
import { HydratedDocument } from "mongoose";

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

// const verifyEmail = async (payload: Payload) : Promise<{error: Error | null, auth: HydratedDocument | null}> => {
//   const email = payload.email;
//   const verificationOTP = payload.verificationOTP;

//   let error: Error | null;
//   let auth: typeof Auth | null;

//   [error, auth] = await to(Auth.findOne({email}));

//   return { error, auth };
// };

// const activate = async (req: Request, res: Response): Promise<any> => {
//  verifyEmail(req.body);
// };

const AuthController = {
  register,
};

export default AuthController;
