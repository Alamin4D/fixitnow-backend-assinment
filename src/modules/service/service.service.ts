import { Prisma } from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";

const getAll = async (filters: {
    categoryId?: string;
    minPrice?: string;
    maxPrice?: string;
    search?: string;
    location?: string;
    page?: string;
    limit?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
}) => {
    const page = parseInt(filters.page || "1");
    const limit = parseInt(filters.limit || "10");
    const skip = (page - 1) * limit;
    const sortBy = filters.sortBy || "createdAt";
    const sortOrder = filters.sortOrder || "desc";

    const where: Prisma.ServiceWhereInput = { isActive: true };

    if (filters.categoryId) where.categoryId = filters.categoryId;

    if (filters.minPrice || filters.maxPrice) {
        where.price = {};
        if (filters.minPrice) where.price.gte = parseFloat(filters.minPrice);
        if (filters.maxPrice) where.price.lte = parseFloat(filters.maxPrice);
    }

    if (filters.search) {
        where.OR = [
            { title: { contains: filters.search, mode: "insensitive" } },
            { description: { contains: filters.search, mode: "insensitive" } },
        ];
    }

    if (filters.location) {
        where.technician = {
            location: { contains: filters.location, mode: "insensitive" },
        };
    }


    const [services, total] = await Promise.all([
        prisma.service.findMany({
            where,
            include: {
                category: true,
                technician: {
                    include: {
                        user: { select: { id: true, name: true, email: true, phone: true } },
                    },
                },
            },
            skip,
            take: limit,
            orderBy: { [sortBy]: sortOrder },
        }),
        prisma.service.count({ where }),
    ]);

    return {
        data: services,
        meta: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
        },
    };
};

const getById = async (id: string) => {
    const service = await prisma.service.findUnique({
        where: { id },
        include: {
            category: true,
            technician: {
                include: {
                    user: { select: { id: true, name: true, email: true, phone: true } },
                    availability: true,
                    reviews: {
                        include: { customer: { select: { name: true } } },
                        orderBy: { createdAt: "desc" },
                        take: 10,
                    },
                },
            },
        },
    });
    if (!service)
        throw new Error("Service not found.");
    return service;
};

const create = async (technicianUserId: string, payload: {
    title: string;
    description: string;
    price: number;
    duration: number;
    categoryId: string;
}) => {
    const techProfile = await prisma.technicianProfile.findUnique({
        where: { userId: technicianUserId },
    });
    if (!techProfile)
        throw new Error("Create your technician profile first.");

    const category = await prisma.category.findUnique({ where: { id: payload.categoryId } });
    if (!category || !category.isActive)
        throw new Error("Category not found or inactive.");

    const service = await prisma.service.create({
        data: { ...payload, technicianId: techProfile.id },
        include: {
            category: true,
            technician: {
                include: {
                    user: { select: { id: true, name: true, email: true } }
                },
            },
        },
    });
    return service;
};

const update = async (serviceId: string, technicianUserId: string, payload: any) => {
    const service = await prisma.service.findUnique({ where: { id: serviceId } });
    if (!service) throw new Error("Service not found.");

    const techProfile = await prisma.technicianProfile.findUnique({
        where: { userId: technicianUserId },
    });
    if (!techProfile || service.technicianId !== techProfile.id)
        throw new Error("You can only update your own services.");

    const updated = await prisma.service.update({
        where: { id: serviceId },
        data: payload,
        include: { category: true },
    });
    return updated;
};

const remove = async (serviceId: string, technicianUserId: string) => {
    const service = await prisma.service.findUnique({ where: { id: serviceId } });
    if (!service) throw new Error("Service not found.");

    const techProfile = await prisma.technicianProfile.findUnique({
        where: { userId: technicianUserId },
    });
    if (!techProfile || service.technicianId !== techProfile.id)
        throw new Error("You can only delete your own services.");

    await prisma.service.update({
        where: { id: serviceId }, data: { isActive: false }
    });
    return null;
};

export const ServiceService = {
    getAll,
    getById,
    create,
    update,
    remove
};