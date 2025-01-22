import User from "@models/userModel";
import Event from "@models/eventModel";
import to from "await-to-ts";
import { Request, Response, NextFunction } from "express";
import Stripe from "stripe";
import createError from "http-errors";
import { StatusCodes } from "http-status-codes";
import { Types } from "mongoose";
import { v4 as uuidv4 } from "uuid";
import { NotificationType, RequestStatus, TransactionSubject } from "@shared/enum";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const linkStripeAccount = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  const userId = req.user.userId;
  let error, user, account;

  [error, user] = await to(User.findById(userId));
  if (error) return next(error);
  if (!user) return next(createError(StatusCodes.NOT_FOUND, "User not found"));

  [error, account] = await to(stripe.accounts.create({ type: "express" }));
  if (error) return next(error);

  user.stripeAccountId = account.id;
  user.stripeAccoutStatus = false;
  [error] = await to(user.save());
  if (error) return next(error);

  const accountLink = await stripe.accountLinks.create({
    account: user.stripeAccountId,
    refresh_url: "https://example.com/cancel",
    return_url: `https://example.com/success?accountId=${user.stripeAccountId}`,
    type: "account_onboarding",
  });

  res.status(StatusCodes.OK).json({ success: true, message: "Success", data: { accountLink: accountLink.url } });
};

const webhook = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;
  const sig = req.headers["stripe-signature"]!;

  try {
    const webhook_event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    let error, user, event, eventHost;
    if (webhook_event.type === "account.updated") {
      const account = webhook_event.data.object as Stripe.Account;
      const stripeAccountId = account.id;
      [error, user] = await to(User.findOne({ stripeAccountId }));
      if (error) throw error;
      if (!user) throw createError(StatusCodes.NOT_FOUND, "User not found");

      if (account.details_submitted && account.charges_enabled) {
        user.stripeAccoutStatus = true;
        [error] = await to(user.save());
        if (error) throw error;
      }
    }

    if (webhook_event.type === "payment_intent.succeeded") {
      const paymentIntent = webhook_event.data.object as Stripe.PaymentIntent;

      const type = paymentIntent.metadata.type;

      if (type == TransactionSubject.EVENT) {
        const eventId = paymentIntent.metadata.eventId;
        console.log(`Ticket payment succeeded for eventId: ${eventId}`);
        [error, event] = await to(Event.findById(eventId));
        if (error) throw error;
        if (!event) {
          console.error(`Event not found for ID: ${eventId}`);
          return res.status(StatusCodes.OK).send();
        }
        event.paid = true;
        [error] = await to(event.save());
        if (error) throw error;
      }

      if (type === TransactionSubject.HIRING) {
        const hirerId = paymentIntent.metadata.hirerId;
        const hiredId = paymentIntent.metadata.hiredId;
        const requestId = paymentIntent.metadata.requestId;

        console.log(`Hiring payment succeeded for hirerId: ${hirerId}, hiredId: ${hiredId}`);

        let hirer, hired;
        [error, hirer] = await to(User.findById(hirerId));
        if (error) throw error;
        if (!hirer) {
          console.error(`User not found for ID: ${hirerId}`);
          return res.status(StatusCodes.OK).send();
        }

        [error, hired] = await to(User.findById(hiredId));
        if (error) throw error;
        if (!hired) {
          console.error(`Hired not found for ID: ${hiredId}`);
          return res.status(StatusCodes.OK).send();
        }

        const hirerRequest = hirer.requests!.find((r) => r.id === requestId);
        const hiredRequest = hired.requests!.find((r) => r.id === requestId);

        hirerRequest!.status = RequestStatus.COMPLETED;
        hiredRequest!.status = RequestStatus.COMPLETED;

        [error] = await to(hirer.save());
        if (error) throw error;
        [error] = await to(hired.save());
        if (error) throw error;
      }
      if (type === TransactionSubject.TICKET) {
        const quantity = paymentIntent.metadata.quantity;
        const userId = paymentIntent.metadata.userId;
        const eventId = paymentIntent.metadata.eventId;

        console.log(`Payment succeeded for userId: ${userId}, eventId: ${eventId}`);

        [error, user] = await to(User.findById(userId));
        if (error) throw error;
        if (!user) {
          console.error(`User not found for ID: ${userId}`);
          return res.status(StatusCodes.OK).send();
        }

        console.log(user);

        [error, event] = await to(Event.findById(eventId));
        if (error) throw error;
        if (!event) {
          console.error(`Event not found for ID: ${eventId}`);
          return res.status(StatusCodes.OK).send();
        }

        console.log(event);

        [error, eventHost] = await to(User.findById(event.host));
        if (error) throw error;
        if (!eventHost) {
          console.error(`Event host not found for ID: ${event.host}`);
          return res.status(StatusCodes.OK).send();
        }

        console.log(eventHost);

        const ticket = {
          event: event._id as Types.ObjectId,
          title: event.title,
          description: event.description,
          cover: event.cover,
          map: event.map,
          date: event.date,
          quantity: Number.parseInt(quantity),
          customId: uuidv4(),
        };
        user.tickets?.push(ticket);

        console.log(user.tickets);

        const guest = {
          user: new Types.ObjectId(userId),
          event: new Types.ObjectId(eventId),
          name: user.name,
          avatar: user.avatar ?? null,
          quantity: Number.parseInt(quantity),
          eventTitle: event.title,
          eventDate: event.date,
        };
        eventHost.guests?.push(guest);

        user.notifications! = user.notifications || [];
        const notification = {
          types: NotificationType.TICKET,
          metadata: {
            eventTitle: event.title,
            eventId: event._id as Types.ObjectId,
          },
        };
        user.notifications.push(notification);

        await Promise.all([
          user.save(),
          eventHost.save(),
          Event.updateOne(
            { _id: eventId },
            {
              $inc: {
                ticketSell: quantity,
                availableTickets: -quantity,
              },
            }
          ),
        ]);
      }

      res.status(StatusCodes.OK).send();
    }
  } catch (error: any) {
    console.log(error);
    next(error);
  }
};

const StripeServices = {
  linkStripeAccount,
  webhook,
};

export default StripeServices;
