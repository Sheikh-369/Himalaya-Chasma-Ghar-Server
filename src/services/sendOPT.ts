import crypto from "crypto";

export function sendOTP() {
  return crypto.randomInt(100000, 999999);
}
// console.log(generateOTP());