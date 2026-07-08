import { BookingStatus, Prisma } from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";

const createProfile = async (userId: string, payload: { bio?: string; experience: number; location: string; profilePicture?: string }) => {
    const existing = await prisma.technicianProfile.findUnique({ where: { userId } });
    if (existing) throw new Error("Profile already exists. Use update instead.");

    const profile = await prisma.technicianProfile.create({
        data: { userId, ...payload },
        include: { user: { select: { id: true, name: true, email: true } } },
    });
    return profile;
};

const updateProfile = async (userId: string, payload: { bio?: string; experience?: number; location?: string; isAvailable?: boolean }) => {
    const profile = await prisma.technicianProfile.findUnique({ where: { userId } });
    if (!profile) throw new Error("Profile not found. Create one first.");

    const updated = await prisma.technicianProfile.update({
        where: { userId },
        data: payload,
        include: {
            user: { select: { id: true, name: true, email: true } },
            services: { where: { isActive: true }, include: { category: true } },
        },
    });
    return updated;
};

const updateAvailability = async (userId: string, slots: { dayOfWeek: number; startTime: string; endTime: string; isAvailable: boolean }[]) => {
    const profile = await prisma.technicianProfile.findUnique({ where: { userId } });
    if (!profile) throw new Error("Profile not found.");

    await prisma.availability.deleteMany({ where: { technicianId: profile.id } });

    await prisma.availability.createMany({
        data: slots.map((slot) => ({ technicianId: profile.id, ...slot })),
    });

    const updatedSlots = await prisma.availability.findMany({
        where: { technicianId: profile.id },
        orderBy: { dayOfWeek: "asc" },
    });
    return updatedSlots;
};

const getMyBookings = async (userId: string, filters: { status?: string; page?: string; limit?: string }) => {
    const profile = await prisma.technicianProfile.findUnique({ where: { userId } });
    if (!profile) throw new Error("Profile not found.");

    const page = parseInt(filters.page || "1");
    const limit = parseInt(filters.limit || "10");
    const skip = (page - 1) * limit;

    const where: Prisma.BookingWhereInput = { technicianId: profile.id };
    if (filters.status) where.status = filters.status as BookingStatus;

    const [bookings, total] = await Promise.all([
        prisma.booking.findMany({
            where,
            include: {
                customer: { select: { id: true, name: true, email: true, phone: true } },
                service: { include: { category: true } },
                payment: true,
            },
            skip,
            take: limit,
            orderBy: { createdAt: "desc" },
        }),
        prisma.booking.count({ where }),
    ]);

    return { data: bookings, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
};

const updateBookingStatus = async (userId: string, bookingId: string, status: string) => {
    const profile = await prisma.technicianProfile.findUnique({ where: { userId } });
    if (!profile) throw new Error("Profile not found.");

    const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
    if (!booking) throw new Error("Booking not found.");
    if (booking.technicianId !== profile.id) throw new Error("You can only manage your own bookings.");

    const validTransitions: Record<string, string[]> = {
        REQUESTED: ["ACCEPTED", "DECLINED"],
        ACCEPTED: ["IN_PROGRESS"],
        PAID: ["IN_PROGRESS"],
        IN_PROGRESS: ["COMPLETED"],
    };

    const allowed = validTransitions[booking.status];
    if (!allowed || !allowed.includes(status))
        throw new Error(`Cannot change from ${booking.status} to ${status}. Allowed: ${allowed?.join(", ") || "none"}.`);

    const updateData: any = { status: status as BookingStatus };
    if (status === "COMPLETED") updateData.completedAt = new Date();

    const updated = await prisma.booking.update({
        where: { id: bookingId },
        data: updateData,
        include: {
            customer: { select: { id: true, name: true, email: true, phone: true } },
            service: { include: { category: true } },
            payment: true,
        },
    });
    return updated;
};

export const TechnicianManageService = {
    createProfile,
    updateProfile,
    updateAvailability,
    getMyBookings,
    updateBookingStatus
};