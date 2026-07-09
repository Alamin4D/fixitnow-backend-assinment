import Stripe from "stripe";
import { v4 as uuidv4 } from "uuid";
import { prisma } from "../../lib/prisma";
import config from "../../config";

const stripe = new Stripe(config.stripe_secret_key);


const createCheckoutSession = async (userId: string, bookingId: string) => {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { service: true, payment: true },
  });

  if (!booking) 
    throw new Error("Booking not found.");
  if (booking.customerId !== userId) 
    throw new Error("You can only pay for your own bookings.");
  if (booking.status !== "ACCEPTED") 
    throw new Error(`Booking must be ACCEPTED. Current: ${booking.status}.`);
  if (booking.payment && booking.payment.status === "COMPLETED") 
    throw new Error("Already paid.");

  // Stripe Checkout Session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: booking.service.title,
            description: booking.service.description,
          },
          unit_amount: Math.round(booking.totalAmount * 100),
        },
        quantity: 1,
      },
    ],
    metadata: {
      bookingId: booking.id,
      userId: userId,
    },
    success_url: `${config.app_url}/payment/success?session_id={CHECKOUT_SESSION_ID}&booking_id=${booking.id}`,
    cancel_url: `${config.app_url}/payment/cancel?booking_id=${booking.id}`,
  });

  const transactionId = `TXN-${uuidv4().toUpperCase()}`;


  let payment;
  if (booking.payment) {
    payment = await prisma.payment.update({
      where: { id: booking.payment.id },
      data: {
        stripePaymentId: session.id,
        status: "PENDING",
      },
    });
  } else {
    payment = await prisma.payment.create({
      data: {
        bookingId: booking.id,
        userId,
        transactionId,
        amount: booking.totalAmount,
        currency: "usd",
        method: "STRIPE",
        provider: "stripe",
        status: "PENDING",
        stripePaymentId: session.id,
      },
    });
  }

  return {
    payment,
    checkoutUrl: session.url,
    sessionId: session.id,
    message: "Redirect to checkoutUrl to complete payment.",
  };
};



const verifyPayment = async (userId: string, sessionId: string) => {
  const session = await stripe.checkout.sessions.retrieve(sessionId);

  if (!session) throw new Error("Invalid session.");


  const payment = await prisma.payment.findFirst({
    where: { stripePaymentId: sessionId },
    include: { booking: true },
  });

  if (!payment) throw new Error("Payment not found.");
  if (payment.userId !== userId) 
    throw new Error("You can only verify your own payments.");
  if (payment.status === "COMPLETED") 
    throw new Error("Payment already completed.");

  if (session.payment_status === "paid") {
    const [updatedPayment] = await prisma.$transaction([
      prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: "COMPLETED",
          paidAt: new Date(),
        },
        include: {
          booking: {
            include: {
              service: { include: { category: true } },
              customer: { select: { id: true, name: true, email: true } },
            },
          },
        },
      }),
      prisma.booking.update({
        where: { id: payment.bookingId },
        data: { status: "PAID" },
      }),
    ]);

    return {
      payment: updatedPayment,
      message: "Payment completed successfully!",
    };
  } else {
    // Payment fail
    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: "FAILED" },
    });
    throw new Error(`Payment not completed. Status: ${session.payment_status}`);
  }
};


const createPaymentIntent = async (userId: string, bookingId: string) => {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { service: true, payment: true },
  });

  if (!booking) throw new Error("Booking not found.");
  if (booking.customerId !== userId)
     throw new Error("You can only pay for your own bookings.");
  if (booking.status !== "ACCEPTED")
     throw new Error(`Booking must be ACCEPTED. Current: ${booking.status}.`);
  if (booking.payment && booking.payment.status === "COMPLETED") 
    throw new Error("Already paid.");

  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(booking.totalAmount * 100),
    currency: "usd",
    metadata: { bookingId: booking.id, userId },
    payment_method: "pm_card_visa",
    confirm: true,
    automatic_payment_methods: { enabled: true, allow_redirects: "never" },
  });

  const transactionId = `TXN-${uuidv4().toUpperCase()}`;

  let payment;
  if (booking.payment) {
    payment = await prisma.payment.update({
      where: { id: booking.payment.id },
      data: {
        stripePaymentId: paymentIntent.id,
        status: paymentIntent.status === "succeeded" ? "COMPLETED" : "PENDING",
        paidAt: paymentIntent.status === "succeeded" ? new Date() : null,
      },
    });
  } else {
    payment = await prisma.payment.create({
      data: {
        bookingId: booking.id,
        userId,
        transactionId,
        amount: booking.totalAmount,
        currency: "usd",
        method: "STRIPE",
        provider: "stripe",
        status: paymentIntent.status === "succeeded" ? "COMPLETED" : "PENDING",
        stripePaymentId: paymentIntent.id,
        paidAt: paymentIntent.status === "succeeded" ? new Date() : null,
      },
    });
  }

  if (paymentIntent.status === "succeeded") {
    await prisma.booking.update({
      where: { id: bookingId },
      data: { status: "PAID" },
    });
  }

  return {
    payment,
    paymentIntentId: paymentIntent.id,
    paymentStatus: paymentIntent.status,
    message: paymentIntent.status === "succeeded"
      ? "Payment completed successfully!"
      : "Payment is pending.",
  };
};

// Payment history
const getMyPayments = async (
  userId: string,
  filters: { status?: string; page?: string; limit?: string }
) => {
  const page = parseInt(filters.page || "1");
  const limit = parseInt(filters.limit || "10");
  const skip = (page - 1) * limit;

  const where: any = { userId };
  if (filters.status) where.status = filters.status;

  const [payments, total] = await Promise.all([
    prisma.payment.findMany({
      where,
      include: {
        booking: {
          include: {
            service: { include: { category: true } },
            technician: {
              include: { user: { select: { name: true, email: true } } },
            },
          },
        },
      },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.payment.count({ where }),
  ]);

  return {
    data: payments,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
};

// Single payment
const getPaymentById = async (userId: string, paymentId: string, role: string) => {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: {
      booking: {
        include: {
          customer: { select: { id: true, name: true, email: true, phone: true } },
          service: { include: { category: true } },
          technician: {
            include: { user: { select: { name: true, email: true } } },
          },
        },
      },
    },
  });

  if (!payment) throw new Error("Payment not found.");
  if (role !== "ADMIN" && payment.userId !== userId) throw new Error("You can only view your own payments.");
  return payment;
};

export const PaymentService = {
  createCheckoutSession,
  verifyPayment,
  createPaymentIntent,
  getMyPayments,
  getPaymentById,
};