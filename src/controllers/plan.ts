import Stripe from "stripe";
import { Request, Response } from "express";
import Plan, { PlanDocument } from "@models/plan";
import "dotenv/config";
import to from "await-to-ts";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

type Param = {
  id: string;
};

const create = async (
  req: Request<{}, {}, Partial<PlanDocument>>,
  res: Response
): Promise<any> => {
  const { name, description, unitAmount, interval } = req.body;
  const [error, product] = await to(
    stripe.products.create({
      name: name!,
      description: description,
    })
  );
  if (error) return res.status(500).json({ error: error.message });

  const [priceError, price] = await to(
    stripe.prices.create({
      product: product.id,
      unit_amount: unitAmount,
      currency: "usd",
      recurring: {
        interval: interval!,
      },
    })
  );
  if (priceError) return res.status(500).json({ error: priceError.message });

  const [planError, plan] = await to(
    Plan.create({
      name: name,
      description: description,
      unitAmount: unitAmount,
      interval: interval,
      productId: product.id,
      priceId: price.id,
    })
  );
  if (planError) return res.status(500).json({ error: planError.message });

  res.status(201).json({
    message: "Plan created successfully",
    data: plan,
  });
};

const displayAll = async (req: Request, res: Response): Promise<any> => {
  const [error, plans] = await to(Plan.find().lean());
  if (error) return res.status(500).json({ error: error.message });
  return res.status(200).json({ plans: plans });
};

const displayById = async (
  req: Request<Param>,
  res: Response
): Promise<any> => {
  const id = req.params.id;
  const [error, plan] = await to(Plan.findById(id).lean());
  if (error) return res.status(500).json({ error: error.message });
  return res.status(200).json({ plans: plan });
};

const update = async (
  req: Request<Param, {}, Partial<PlanDocument>>,
  res: Response
): Promise<any> => {
  const id = req.params.id;
  let { name, description, unitAmount, interval } = req.body;

  const [error, plan] = await to(Plan.findById(id));
  if (error) return res.status(500).json({ error: error.message });
  if (!plan) return res.status(404).json({ error: "Plan not found" });

  let updatedProductFields: Partial<PlanDocument> = {};

  if (name || description) {
    if (name) updatedProductFields.name = name;
    if (description) updatedProductFields.description = description;

    const [productError] = await to(
      stripe.products.update(plan.productId, updatedProductFields)
    );
    if (productError) {
      return res.status(500).json({ error: productError.message });
    }
  }

  let updatedPlanData: Partial<PlanDocument> = {};

  if (unitAmount || interval) {
    let [priceError] = await to(
      stripe.prices.update(plan.priceId, {
        active: false,
      })
    );
    if (priceError) {
      return res.status(500).json({ error: priceError.message });
    }
    if (!unitAmount) {
      unitAmount = plan.unitAmount;
    }
    if (!interval) {
      interval = plan.interval;
    }
    const [newPriceError, newPrice] = await to(
      stripe.prices.create({
        product: plan.productId,
        unit_amount: unitAmount,
        currency: "usd",
        recurring: {
          interval: interval!,
        },
      })
    );
    if (newPriceError) {
      return res.status(500).json({ error: newPriceError.message });
    }
    if (newPrice) updatedPlanData.priceId = newPrice.id;
  }

  if (name) updatedPlanData.name = name;
  if (description) updatedPlanData.description = description;
  if (unitAmount) updatedPlanData.unitAmount = unitAmount;
  if (interval) updatedPlanData.interval = interval;

  const [dbError, updatedPlan] = await to(
    Plan.findByIdAndUpdate(id, { $set: updatedPlanData }, { new: true })
  );
  if (dbError) {
    return res.status(500).json({ error: dbError.message });
  }

  res.status(200).json({
    message: "Plan updated successfully",
    data: updatedPlan,
  });
};

const PlanController = {
  create,
  displayAll,
  displayById,
  update,
};

export default PlanController;
