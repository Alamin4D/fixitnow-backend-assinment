import { Prisma, UserStatus } from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";

const getAllUsers = async (filters: { role?: string; status?: string; search?: string; page?: string; limit?: string }) => {
  const page = parseInt(filters.page || "1");
  const limit = parseInt(filters.limit || "10");
  const skip = (page - 1) * limit;
  const where: Prisma.UserWhereInput = {};
  if (filters.role) where.role = filters.role as any;
  if (filters.status) where.status = filters.status as UserStatus;
  if (filters.search) { where.OR = [{ name: { contains: filters.search, mode: "insensitive" } }, { email: { contains: filters.search, mode: "insensitive" } }]; }

  const [users, total] = await Promise.all([
    prisma.user.findMany({ where, select: { id: true, name: true, email: true, role: true, status: true, phone: true, address: true, createdAt: true, updatedAt: true, technicianProfile: { select: { id: true, location: true, rating: true, totalReviews: true, isAvailable: true } } }, skip, take: limit, orderBy: { createdAt: "desc" } }),
    prisma.user.count({ where }),
  ]);
  return { data: users, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
};

const updateUserStatus = async (userId: string, status: "ACTIVE" | "BANNED") => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("User not found.");
  if (user.role === "ADMIN") throw new Error("Cannot change admin status.");

  const updated = await prisma.user.update({ where: { id: userId }, data: { status: status as UserStatus }, select: { id: true, name: true, email: true, role: true, status: true, updatedAt: true } });
  return updated;
};

const getAllBookings = async (filters: { status?: string; page?: string; limit?: string }) => {
  const page = parseInt(filters.page || "1");
  const limit = parseInt(filters.limit || "10");
  const skip = (page - 1) * limit;
  const where: Prisma.BookingWhereInput = {};
  if (filters.status) where.status = filters.status as any;

  const [bookings, total] = await Promise.all([
    prisma.booking.findMany({ where, include: { customer: { select: { id: true, name: true, email: true } }, technician: { include: { user: { select: { id: true, name: true, email: true } } } }, service: { include: { category: true } }, payment: true, review: true }, skip, take: limit, orderBy: { createdAt: "desc" } }),
    prisma.booking.count({ where }),
  ]);
  return { data: bookings, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
};

export const AdminService = { 
    getAllUsers, 
    updateUserStatus, 
    getAllBookings 
};