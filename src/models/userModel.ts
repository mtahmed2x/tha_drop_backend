import { model, Schema } from "mongoose";
import { UserSchema } from "../schemas/userSchema";
import { Gender, Role } from "../shared/enum";

const userSchema = new Schema<UserSchema>({
    auth: {
        type: Schema.Types.ObjectId,
        ref: "Auth",
        required: true
    },
    name: {
        type: String,
        required: true
    },
    role: {
        type: String,
        required: true,
        enum: Role
    },
    phoneNumber: {
        type: String,
        required: true
    },
    address: {
        type: String
    },
    license: {
        type: String,
        required: true
    },
    dateOfBirth: {
        type: String
    },
    gender: {
        type: String,
        enum: Gender
    },
    avatar: {
        type: String
    }
});

const User = model<UserSchema>("User", userSchema);
export default User;