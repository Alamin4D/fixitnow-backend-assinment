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

const getProfile = async (userId: string) => {
  const profile = await prisma.technicianProfile.findUnique({
    where: {
      userId,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
        },
      },
      services: true,
      availability: {
        orderBy: {
          dayOfWeek: "asc",
        },
      },
    },
  });

  if (!profile) {
    throw new Error(
      "Technician profile not found"
    );
  }

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

const getAvailability = async (userId: string) => {
  const technician = await prisma.technicianProfile.findUnique({
    where: {
      userId,
    },
    select: {
      id: true,
    },
  });

  if (!technician) {
    throw new Error(
      "Technician profile not found"
    );
  }

  const availability = await prisma.availability.findMany({
    where: {
      technicianId: technician.id,
    },
    orderBy: [
      {
        dayOfWeek: "asc",
      },
      {
        startTime: "asc",
      },
    ],
  });

  return availability;
};

const getDashboard = async (userId: string) => {
  const technician = await prisma.technicianProfile.findUnique({
    where: {
      userId,
    },
    select: {
      id: true,
    },
  });

  if (!technician) {
    throw new Error("Technician profile not found.");
  }

  const technicianId = technician.id;

  const [
    totalBookings,
    pendingRequests,
    completedJobs,
    earnings,
    bookingStatus,
    bookings,
    recentBookings,
  ] = await Promise.all([
    // Total bookings
    prisma.booking.count({
      where: {
        technicianId,
      },
    }),

    // Pending requests
    prisma.booking.count({
      where: {
        technicianId,
        status: BookingStatus.REQUESTED,
      },
    }),

    // Completed jobs
    prisma.booking.count({
      where: {
        technicianId,
        status: BookingStatus.COMPLETED,
      },
    }),

    // Total earnings
    prisma.booking.aggregate({
      where: {
        technicianId,
        status: BookingStatus.COMPLETED,
      },
      _sum: {
        totalAmount: true,
      },
    }),

    // Booking status
    prisma.booking.groupBy({
      by: ["status"],
      where: {
        technicianId,
      },
      _count: {
        id: true,
      },
    }),

    // Monthly analytics
    prisma.booking.findMany({
      where: {
        technicianId,
      },
      select: {
        status: true,
        totalAmount: true,
        scheduledDate: true,
      },
      orderBy: {
        scheduledDate: "asc",
      },
    }),

    // Recent bookings
    prisma.booking.findMany({
      where: {
        technicianId,
      },
      take: 6,
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        scheduledDate: true,
        scheduledTime: true,
        totalAmount: true,
        status: true,

        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },

        service: {
          select: {
            id: true,
            title: true,

            category: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    }),
  ]);

  // -----------------------------
  // Monthly Analytics
  // -----------------------------

  const monthlyMap = new Map<
    string,
    {
      key: string;
      month: string;
      bookings: number;
      earnings: number;
    }
  >();

  bookings.forEach((booking) => {
    const date = new Date(booking.scheduledDate);

    const year = date.getFullYear();
    const monthIndex = date.getMonth();

    const key = `${year}-${String(monthIndex + 1).padStart(
      2,
      "0"
    )}`;

    const month = date.toLocaleString("en-US", {
      month: "short",
    });

    if (!monthlyMap.has(key)) {
      monthlyMap.set(key, {
        key,
        month,
        bookings: 0,
        earnings: 0,
      });
    }

    const current = monthlyMap.get(key)!;

    current.bookings += 1;

    if (booking.status === BookingStatus.COMPLETED) {
      current.earnings += booking.totalAmount;
    }
  });

  const monthlyAnalytics = Array.from(
    monthlyMap.values()
  );

  // -----------------------------
  // Booking Status
  // -----------------------------

  const statusData = bookingStatus.map((item) => ({
    status: item.status,
    count: item._count.id,
  }));

  // -----------------------------
  // Final Response
  // -----------------------------

  return {
    stats: {
      totalBookings,
      pendingRequests,
      completedJobs,
      totalEarnings:
        earnings._sum.totalAmount ?? 0,
    },

    bookingStatus: statusData,

    monthlyAnalytics,

    recentBookings,
  };
};

export const TechnicianManageService = {
    createProfile,
    getProfile,
    updateProfile,
    getAvailability,
    updateAvailability,
    getMyBookings,
    updateBookingStatus,
    getDashboard
};