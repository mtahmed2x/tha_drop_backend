// import Stripe from "stripe";
// import { Request, Response, NextFunction } from "express";
// import "dotenv/config";
// import to from "await-to-ts";
// import Ticket from "@models/"


// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// const create = async (
//   req: Request,
//   res: Response
// ): Promise<any> => {
//   const { name, description, unitAmount } = req.body;
//   const [error, product] = await to(
//     stripe.products.create({
//       name: name!,
//       description: description,
//     })
//   );
//   if (error) return res.status(500).json({ error: error.message });

//   const [priceError, price] = await to(
//     stripe.prices.create({
//       product: product.id,
//       unit_amount: unitAmount,
//       currency: "usd",
//     })
//   );
//   if (priceError) return res.status(500).json({ error: priceError.message });

//   const [ticketError, ticket] = await to(
//     Ticket.create({
//       name: name,
//       description: description,
//       unitAmount: unitAmount,
//       productId: product.id,
//       priceId: price.id,
//     })
//   );
//   if (ticketError) return res.status(500).json({ error: ticketError.message });

//   res.status(201).json({
//     message: "Ticket created successfully",
//     data: ticket,
//   });
// };

// type TicketBuy = {
//   priceId: string;
//   accountId: string;
// };

// const buy = async (
//   req: Request<{}, {}, TicketBuy>,
//   res: Response,
//   next: NextFunction
// ): Promise<any> => {
//   const { priceId, accountId } = req.body;
//   const [error, session] = await to(
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

// const TicketController = {
//   create,
//   buy,
// };

// export default TicketController;
