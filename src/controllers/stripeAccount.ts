import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
import { Request, Response } from "express";

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

const AccountController = {
  linkAccount,
};

export default AccountController;
