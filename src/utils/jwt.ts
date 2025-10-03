import jwt from "jsonwebtoken";

export const generateJwt = (id: string) => {
  const token = jwt.sign({ id }, process.env.JWT_SECRET as string, {
    expiresIn: "30d",
  });
  return token;
};
export const verifyJwt = (token: string) => {
  const verifiedToken = jwt.verify(token, process.env.JWT_SECRET as string);
  return verifiedToken;
};
