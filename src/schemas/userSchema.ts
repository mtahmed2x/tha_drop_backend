import { Document, Types } from "mongoose";
import { Gender, Role } from "@shared/enum";

export type UserSchema = Document & {
    auth: Types.ObjectId;
    name: string;
    phoneNumber: string;
    address: string;
    dateOfBirth: string;
    gender: Gender;
    avatar: string;
    licensePhoto: string;
    isResturentOwner: boolean;
    resturentName?: string;
};
