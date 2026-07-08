import { Prisma } from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";

const getAll = async (filters: {
  location?: string;
  minRating?: string;
  search?: string;
  categoryId?: string;
  page?: string;
  limit?: string;
}) => {
  const page = parseInt(filters.page || "1");
  const limit = parseInt(filters.limit || "10");
  const skip = (page - 1) * limit;

  const where: Prisma.TechnicianProfileWhereInput = {
    isAvailable: true,
    user: { status: "ACTIVE" },
  };

  if (filters.location) where.location = { contains: filters.location, mode: "insensitive" };
  if (filters.minRating) where.rating = { gte: parseFloat(filters.minRating) };
  if (filters.search) {
    where.OR = [
      { bio: { contains: filters.search, mode: "insensitive" } },
      { user: { name: { contains: filters.search, mode: "insensitive" } } },
    ];
  }
  if (filters.categoryId) {
    where.services = { some: { categoryId: filters.categoryId, isActive: true } };
  }

  const [technicians, total] = await Promise.all([
    prisma.technicianProfile.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
        services: { where: { isActive: true }, include: { category: true } },
        _count: { select: { reviews: true, bookings: true } },
      },
      skip,
      take: limit,
      orderBy: { rating: "desc" },
    }),
    prisma.technicianProfile.count({ where }),
  ]);

  return {
    data: technicians,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
};

const getById = async (id: string) => {
  const technician = await prisma.technicianProfile.findFirst({
    where: { OR: [{ id }, { userId: id }] },
    include: {
      user: { select: { id: true, name: true, email: true, phone: true } },
      services: { where: { isActive: true }, include: { category: true } },
      availability: { orderBy: { dayOfWeek: "asc" } },
      reviews: {
        include: { customer: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
        take: 20,
      },
      _count: { select: { reviews: true, bookings: true } },
    },
  });
  if (!technician) throw new Error("Technician not found.");
  return technician;
};

export const TechnicianService = { 
    getAll, 
    getById 
};