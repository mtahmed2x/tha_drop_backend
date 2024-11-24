import "dotenv/config";
import Stripe from "stripe";
import Plan from "@models/plan";
import Subscription from "@models/subscription";
import to from "await-to-ts";
import { Request, Response } from "express";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

type Params = {
  id: string;
};

const checkout = async (req: Request<Params>, res: Response): Promise<any> => {
  const userId = req.user.userId;
  const { id } = req.params;
  let error, plan, session;
  [error, plan] = await to(Plan.findById(id));
  if (error) return res.status(500).json({ error: error.message });
  if (!plan) return res.status(404).json({ error: "Plan Not Found" });

  [error, session] = await to(
    stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      line_items: [
        {
          price: plan.priceId,
          quantity: 1,
        },
      ],
      success_url: `https://example.com/success`,
      cancel_url: `https://example.com/cancel`,
      metadata: {
        user: userId,
        plan: id,
      },
    })
  );
  if (error) return res.status(500).json({ error: error.message });

  const [createError, subscription] = await to(
    Subscription.create({ user: userId, plan: id })
  );
  if (createError) return res.status(500).json({ error: createError.message });
  return res.status(200).json({ session });
};

const SubScriptionController = {
  checkout,
};

export default SubScriptionController;
