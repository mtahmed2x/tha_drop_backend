import crypto from "crypto";

const generateOTP = (length = 6) => {
  return crypto
    .randomBytes(length)
    .toString("base64")
    .replace(/[^a-zA-Z0-9]/g, "")
    .slice(0, length);
};

export default generateOTP;
