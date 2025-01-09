import Stripe from "stripe";
import { Request, Response, NextFunction } from "express";
import Event from "@models/eventModel";
import "dotenv/config";
import to from "await-to-ts";
import createError from "http-errors";
import { StatusCodes } from "http-status-codes";
import User from "@models/userModel";
import { Types } from "mongoose";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const buyTicket = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  const userId = req.user.userId;
  const quantity = req.body.quantity;
  const eventId = req.body.eventId;
  let error, user, event, eventHost, session;

  [error, user] = await to(User.findById(userId));
  if (error) return next(error);
  if (!user) return next(createError(StatusCodes.NOT_FOUND, "User not found"));

  [error, event] = await to(Event.findById(eventId));
  if (error) return next(error);
  if (!event) return next(createError(StatusCodes.NOT_FOUND, "Event not found"));

  [error, eventHost] = await to(User.findById(event.host));
  if (error) return next(error);
  if (!eventHost) return next(createError(StatusCodes.NOT_FOUND, "Event host not found"));

  [error, session] = await to(
    stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price: event.ticketPriceId,
          quantity: Number.parseInt(quantity as string),
        },
      ],
      mode: "payment",
      payment_intent_data: {
        transfer_data: {
          destination: eventHost.stripeAccountId,
        },
        metadata: {
          quantity: Number.parseInt(quantity as string),
          userId: userId,
          eventId: eventId,
        },
      },
      success_url: `https://example.com/success`,
      cancel_url: `https://example.com/cancel`,
    })
  );
  if (error) return next(error);
  return res.status(200).json({ session });
};
//   const userId = req.user.userId;
//   const eventId = req.body.eventId;
//   let error, session, event;

//   [error, event] = await to(Event.findById(eventId));
//   if(error) return next(error);
//   if(!event) return next(createError(StatusCodes.NOT_FOUND, "Event not found"));

//   [error, session] = await to(
//     stripe.checkout.sessions.create({
//       payment_method_types: ["card"],
//       line_items: [
//         {
//           price: priceId,
//           quantity: 1,
//         },
//       ],
//       mode: "payment",
//       payment_intent_data: {
//         transfer_data: {
//           destination: accountId,
//         },
//       },
//       success_url: `https://example.com/success`,
//       cancel_url: `https://example.com/cancel`,
//     })
//   );
//   if (error) return next(error);
//   return res.status(200).json({ session });
// };
