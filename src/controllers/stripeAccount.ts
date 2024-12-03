import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
import { NextFunction, Request, Response } from "express";
import to from "await-to-ts";

type AccountParams = {
  id: string;
};

const linkAccount = async (
  req: Request<{}, {}, AccountParams>,
  res: Response
): Promise<any> => {
  const { id } = req.body;
  const accountLink = await stripe.accountLinks.create({
    account: id,
    refresh_url: `https://example.com/cancel`, // Redirect here if they need to re-submit
    return_url: `https://example.com/success`, // Redirect here upon successful onboarding
    type: "account_onboarding",
  });
  return res.status(200).json({ accountLink, id });
};

const loginAccount = async (
  req: Request<{}, {}, AccountParams>,
  res: Response,
  next: NextFunction
): Promise<any> => {
  const { id } = req.body;
  const [error, login] = await to(stripe.accounts.createLoginLink(id));
  if (error) return next(error);
  return res.status(200).json({ login });
};

const updateSchedule = async (
  req: Request<{}, {}, AccountParams>,
  res: Response,
  next: NextFunction
): Promise<any> => {
  const { id } = req.body;
  const account = await stripe.accounts.update(id, {
    settings: {
      payouts: {
        schedule: {
          interval: "daily",
        },
      },
    },
  });
  return res.status(200).json({ account });
};

const AccountController = {
  linkAccount,
  loginAccount,
  updateSchedule,
};

export default AccountController;
