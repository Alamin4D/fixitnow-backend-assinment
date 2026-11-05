import { Request, Response, NextFunction } from "express";
import { AuthService } from "./auth.service";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status";
import { OAuth2Client } from "google-auth-library";
import jwt, { SignOptions } from "jsonwebtoken";
import { prisma } from "../../lib/prisma";
import config from "../../config";

const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await AuthService.register(req.body);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: "User registered successfully.",
      data: {
        user: result.user,
        accessToken: result.accessToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await AuthService.login(req.body);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "User logged in successfully.",
      data: {
        user: result.user,
        accessToken: result.accessToken,
      },
    });
  } catch (error) {
    next(error);
  }
};



const getMe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await AuthService.getMe(req.user!.id);
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "User profile retrieved successfully.",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};



const googleClient = new OAuth2Client(
  config.google_client_id
);

export const googleLogin = async (
  req: Request,
  res: Response
) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({
        success: false,
        message: "Google credential is required",
      });
    }

    if (!config.google_client_id) {
      console.error("GOOGLE_CLIENT_ID is missing in backend");

      return res.status(500).json({
        success: false,
        message: "Google authentication is not configured",
      });
    }

    if (!config.jwt_access_secret) {
      console.error("JWT_ACCESS_SECRET is missing");

      return res.status(500).json({
        success: false,
        message: "Authentication is not configured",
      });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: config.google_client_id,
    });

    const payload = ticket.getPayload();

    if (!payload) {
      return res.status(401).json({
        success: false,
        message: "Invalid Google credential",
      });
    }

    const googleId = payload.sub;
    const email = payload.email;
    const name = payload.name;
    const picture = payload.picture;

    if (!googleId || !email) {
      return res.status(400).json({
        success: false,
        message: "Google account information is incomplete",
      });
    }

    let user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    // New Google user
    if (!user) {
      user = await prisma.user.create({
        data: {
          name: name || "Google User",
          email,
          password: null,
          googleId,
          avatarUrl: picture || null,
          provider: "GOOGLE",
          role: "CUSTOMER",
          status: "ACTIVE",
        },
      });
    } else {
      // Existing account status
      if (user.status !== "ACTIVE") {
        return res.status(403).json({
          success: false,
          message: "Your account is not active",
        });
      }

      // Link Google account
      user = await prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          googleId: user.googleId || googleId,
          avatarUrl: picture || user.avatarUrl,
          provider: user.provider || "GOOGLE",
        },
      });
    }

    const jwtOptions: SignOptions = {
  expiresIn:
    config.jwt_access_expires_in as SignOptions["expiresIn"],
};

const accessToken = jwt.sign(
  {
    id: user.id,
    email: user.email,
    role: user.role,
  },
  config.jwt_access_secret,
  jwtOptions
);

return res.status(200).json({
  success: true,
  message: "Google login successful",
  accessToken,
  role: user.role,
  user: {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatarUrl: user.avatarUrl,
  },
});
  } catch (error) {
    console.error("GOOGLE AUTH ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Google authentication failed",
    });
  }
};

export const AuthController = {
  register,
  login,
  getMe
};