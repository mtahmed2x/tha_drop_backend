import { Document, Types } from "mongoose";
import { Gender, Role } from "@shared/enum";

export type UserSchema = Document & {
    auth: Types.ObjectId;
    name: string;
    role: Role;
    phoneNumber: string;
    address: string;
    license: string;
    dateOfBirth: string;
    gender: Gender;
    avatar: string;
};
