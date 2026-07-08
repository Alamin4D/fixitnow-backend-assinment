import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma";
import config from "../config";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        name: string;
        email: string;
        role: string;
      };
    }
  }
}


const auth = (...requiredRoles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    let token: string | undefined;

    if (req.headers.authorization) {
      if (req.headers.authorization.startsWith("Bearer ")) {
        token = req.headers.authorization.split(" ")[1];
      } else {
        token = req.headers.authorization;
      }
    } else if (req.cookies?.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token) {
      res.status(401).json({
        success: false,
        message: "You are not authorized! Please login.",
        errorDetails: [
          { path: "authorization", message: "No token provided." },
        ],
      });
      return;
    }

    try {
      const decoded: any = jwt.verify(token, config.jwt_access_secret);

      if (requiredRoles.length > 0 && !requiredRoles.includes(decoded.role)) {
        res.status(403).json({
          success: false,
          message: "Forbidden.",
          errorDetails: [
            {
              path: "role",
              message: `Required: ${requiredRoles.join(", ")}.Your: ${decoded.role}.`
            },
          ],
        });
        return;
      }

      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
      });

      if (!user) {
        res.status(404).json({
          success: false,
          message: "User not found.",
        });
        return;
      }

      if (user.status === "BANNED") {
        res.status(403).json({
          success: false,
          message: "Account banned.",
        });
        return;
      }

      req.user = {
        id: decoded.id,
        name: decoded.name,
        email: decoded.email,
        role: decoded.role,
      };

      next();
    } catch (err: any) {
      res.status(401).json({
        success: false,
        message: "Invalid token.",
        errorDetails: [
          {
            path: "token",
            message: err.message
          }
        ],
      });
      return;
    }
  };
};

export default auth;