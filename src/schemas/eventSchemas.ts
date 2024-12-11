import { Document, Types } from "mongoose";

export type EventSchema = Document & {
    title: string;
    organizer: string;
    host: Types.ObjectId;
    category: Types.ObjectId;
    subCategory: Types.ObjectId;
    date: Date;
    location: string;
    description: string;
    cover: string;
    gallery: string[];
    ticketPrice: Types.Decimal128;
    productId: string;
    ticketPriceId: string;
    deadline: Date;
    mapCoordinates: {
        latitude: number;
        longitude: number;
    };
};
