import { Document, Types } from "mongoose";

export type EventSchema = Document & {
    title: string;
    organizer: string;
    host: Types.ObjectId;
    category: Types.ObjectId;
    subCategory: Types.ObjectId;
    date: Date;
    description: string;
    cover: string;
    gallery?: string[];
    ticketPrice: number;
    productId: string;
    ticketPriceId: string;
    deadline: Date;
    availabe?: number;
    map: {
        location?: string;
        latitude: number;
        longitude: number;
    };
};
