import jwt from "jsonwebtoken";
import config from "../../config";
import { prisma } from "../../lib/prisma";
import bcrypt from "bcryptjs";
import { IRegisterUser } from "./auth.interface";


const generateToken = (payload: object): string => {
  return jwt.sign(payload, config.jwt_access_secret, {
    expiresIn: "1d",
  } as jwt.SignOptions);
};

const register = async (payload: IRegisterUser) => {
  const existingUser = await prisma.user.findUnique({
    where: { email: payload.email },
  });

  if (existingUser) {
    throw new Error("User with this email already exists.");
  }

  const hashedPassword = await bcrypt.hash(
    payload.password,
    config.bcrypt_salt_rounds
  );

  const user = await prisma.user.create({
    data: {
      name: payload.name,
      email: payload.email,
      password: hashedPassword,
      role: payload.role as any,
      phone: payload.phone,
      address: payload.address,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      phone: true,
      address: true,
      status: true,
      createdAt: true,
    },
  });

  const accessToken = generateToken({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  });

  return { user, accessToken };
};

const login = async (payload: { email: string; password: string }) => {
  const user = await prisma.user.findUnique({
    where: { email: payload.email },
  });

  if (!user) {
    throw new Error("Invalid email or password.");
  }

  if (user.status === "BANNED") {
    throw new Error("Your account has been banned.");
  }

  const isPasswordValid = await bcrypt.compare(payload.password, user.password);

  if (!isPasswordValid) {
    throw new Error("Invalid email or password.");
  }

  const accessToken = generateToken({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  });

  const { password, ...userWithoutPassword } = user;

  return { user: userWithoutPassword, accessToken };
};



const getMe = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      phone: true,
      address: true,
      avatarUrl: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      technicianProfile: {
        include: {
          services: {
            where: { isActive: true },
            include: { category: true },
          },
          availability: {
            orderBy: { dayOfWeek: "asc" },
          },
        },
      },
    },
  });

  if (!user) {
    throw new Error("User not found.");
  }

  return user;
};

export const AuthService = { 
  register, 
  login, 
  getMe 
};