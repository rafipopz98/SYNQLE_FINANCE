import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export const isAuthUser = (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies.accessUserToken;
  if (!token) {
    return res
      .status(401)
      .json({ message: "Access denied: No token provided. Please log in." });
  }
  const decodedToken: any | null = jwt.decode(token, { complete: true });
  if (!decodedToken || !decodedToken.payload) {
    return res.status(403).json({
      message: "Access denied: Invalid token. Please try logging in again.",
    });
  }
  const now = Math.floor(Date.now() / 1000);
  if (decodedToken.payload?.exp < now) {
    return res
      .status(403)
      .json({
        message:
          "Access denied: Your session has expired. Please log in again.",
      });
  }
  req.user = decodedToken.payload;
  return next();
};
