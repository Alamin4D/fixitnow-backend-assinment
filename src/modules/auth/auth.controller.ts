import { Request, Response, NextFunction } from "express";
import { AuthService } from "./auth.service";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status";

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

export const AuthController = {
  register,
  login,
  getMe
};