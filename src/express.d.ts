import { DecodedUser } from "@schemas/decodedUser";

declare global {
    namespace Express {
        interface Request {
            user: DecodedUser;

        }
    }
}
