import { prisma } from "../../lib/prisma";

const create = async (customerId: string, payload: { bookingId: string; rating: number; comment?: string }) => {
    const booking = await prisma.booking.findUnique({ where: { id: payload.bookingId }, include: { review: true } });
    if (!booking) throw new Error("Booking not found.");
    if (booking.customerId !== customerId) throw new Error("You can only review your own bookings.");
    if (booking.status !== "COMPLETED") throw new Error("You can only review completed bookings.");
    if (booking.review) throw new Error("Already reviewed.");

    const review = await prisma.$transaction(async (tx) => {
        const newReview = await tx.review.create({
            data: { bookingId: payload.bookingId, customerId, technicianId: booking.technicianId, rating: payload.rating, comment: payload.comment },
            include: { customer: { select: { name: true } }, booking: { include: { service: { include: { category: true } } } } },
        });

        const stats = await tx.review.aggregate({ where: { technicianId: booking.technicianId }, _avg: { rating: true }, _count: { rating: true } });
        await tx.technicianProfile.update({
            where: { id: booking.technicianId },
            data: { rating: Math.round((stats._avg.rating || 0) * 10) / 10, totalReviews: stats._count.rating },
        });
        return newReview;
    });
    return review;
};

const getByTechnicianId = async (technicianId: string, filters: { page?: string; limit?: string }) => {
    const page = parseInt(filters.page || "1");
    const limit = parseInt(filters.limit || "10");
    const skip = (page - 1) * limit;

    const profile = await prisma.technicianProfile.findFirst({ where: { OR: [{ id: technicianId }, { userId: technicianId }] } });
    if (!profile) throw new Error("Technician not found.");

    const [reviews, total] = await Promise.all([
        prisma.review.findMany({ where: { technicianId: profile.id }, include: { customer: { select: { name: true } }, booking: { include: { service: { select: { title: true } } } } }, skip, take: limit, orderBy: { createdAt: "desc" } }),
        prisma.review.count({ where: { technicianId: profile.id } }),
    ]);
    return { data: reviews, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
};

export const ReviewService = {
    create,
    getByTechnicianId
};