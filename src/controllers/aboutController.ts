import About from "@models/aboutModel";
import to from "await-to-ts";
import { Request, Response, NextFunction } from "express";

const update = async(req: Request, res: Response, next: NextFunction) : Promise<any> => {
    const text = req.body.text;
    let error, about;
    [error, about] = await to(About.findOne());
    if(error) return next(error);
    if(!about) {
        [error, about] = await to(About.create({text}));
        if(error) return next(error);
    }
}