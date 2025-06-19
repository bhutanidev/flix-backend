import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import apiError from "../utils/ApiError";

export const attachUserId = (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

    if (!token) {
      return next(new apiError(403, "No token found"));
    }

    const secret = process.env.JWT_SECRET as string;
    const decoded = jwt.verify(token, secret) as { id: string; email: string; role: string };

    if (decoded && typeof decoded === 'object') {
      req.userId = decoded.id;
      req.userRole = decoded.role;
      return next();
    } else {
      return next(new apiError(403, "Not logged in or invalid token"));
    }
  } catch (err) {
    console.error("middleware", err);
    return next(new apiError(403, "Invalid signature"));
  }
};

export const allowAllRoles = (req: Request, res: Response, next: NextFunction) => {
  if (!req.userId || !req.userRole) {
    return next(new apiError(403, "Unauthorized"));
  }
  next();
};

export const allowAdminAndClient = (req: Request, res: Response, next: NextFunction) => {
  if (!req.userId || !req.userRole) {
    return next(new apiError(403, "Unauthorized"));
  }

  if (req.userRole !== 'admin' && req.userRole !== 'client') {
    return next(new apiError(403, "Forbidden: Access denied"));
  }
  next();
};
