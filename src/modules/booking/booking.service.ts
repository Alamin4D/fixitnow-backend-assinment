import { BookingStatus, Prisma } from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";

const create = async (customerId: string, payload: { serviceId: string; scheduledDate: string; scheduledTime: string; address: string; notes?: string }) => {
  const service = await prisma.service.findUnique({ where: { id: payload.serviceId }, include: { technician: true } });
  if (!service || !service.isActive) throw new Error("Service not found or inactive.");
  if (!service.technician.isAvailable) throw new Error("Technician is not available.");

  const scheduledDate = new Date(payload.scheduledDate);
  if (scheduledDate < new Date()) throw new Error("Scheduled date must be in the future.");

  const conflict = await prisma.booking.findFirst({
    where: {
      technicianId: service.technicianId, scheduledDate, scheduledTime: payload.scheduledTime,
      status: { in: ["REQUESTED", "ACCEPTED", "PAID", "IN_PROGRESS"] },
    },
  });
  if (conflict) throw new Error("This time slot is already booked.");

  const booking = await prisma.booking.create({
    data: { customerId, technicianId: service.technicianId, serviceId: payload.serviceId, scheduledDate, scheduledTime: payload.scheduledTime, address: payload.address, notes: payload.notes, totalAmount: service.price, status: "REQUESTED" },
    include: {
      customer: { select: { id: true, name: true, email: true, phone: true } },
      technician: { include: { user: { select: { id: true, name: true, email: true } } } },
      service: { include: { category: true } },
    },
  });
  return booking;
};

const getMyBookings = async (userId: string, role: string, filters: { status?: string; page?: string; limit?: string }) => {
  const page = parseInt(filters.page || "1");
  const limit = parseInt(filters.limit || "10");
  const skip = (page - 1) * limit;

  const where: Prisma.BookingWhereInput = {};
  if (role === "CUSTOMER") where.customerId = userId;
  else if (role === "TECHNICIAN") {
    const profile = await prisma.technicianProfile.findUnique({ where: { userId } });
    if (profile) where.technicianId = profile.id;
  }
  if (filters.status) where.status = filters.status as BookingStatus;

  const [bookings, total] = await Promise.all([
    prisma.booking.findMany({
      where,
      include: {
        customer: { select: { id: true, name: true, email: true, phone: true } },
        technician: { include: { user: { select: { id: true, name: true, email: true } } } },
        service: { include: { category: true } },
        payment: true, review: true,
      },
      skip, take: limit, orderBy: { createdAt: "desc" },
    }),
    prisma.booking.count({ where }),
  ]);

  return { data: bookings, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
};

const getById = async (bookingId: string, userId: string, role: string) => {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      customer: { select: { id: true, name: true, email: true, phone: true } },
      technician: { include: { user: { select: { id: true, name: true, email: true, phone: true } } } },
      service: { include: { category: true } },
      payment: true, review: true,
    },
  });
  if (!booking) throw new Error("Booking not found.");

  if (role === "CUSTOMER" && booking.customerId !== userId) throw new Error("You can only view your own bookings.");
  if (role === "TECHNICIAN") {
    const profile = await prisma.technicianProfile.findUnique({ where: { userId } });
    if (!profile || booking.technicianId !== profile.id) throw new Error("You can only view your own bookings.");
  }
  return booking;
};

const cancel = async (bookingId: string, userId: string, cancellationReason?: string) => {
  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking) throw new Error("Booking not found.");
  if (booking.customerId !== userId) throw new Error("You can only cancel your own bookings.");

  const nonCancellable = ["IN_PROGRESS", "COMPLETED", "CANCELLED", "DECLINED"];
  if (nonCancellable.includes(booking.status)) throw new Error(`Cannot cancel booking with status: ${booking.status}.`);

  const updated = await prisma.booking.update({
    where: { id: bookingId },
    data: { status: "CANCELLED", cancelledAt: new Date(), cancellationReason },
    include: { service: { include: { category: true } }, technician: { include: { user: { select: { name: true, email: true } } } } },
  });
  return updated;
};

export const BookingService = { 
  create, 
  getMyBookings, 
  getById, 
  cancel 
};