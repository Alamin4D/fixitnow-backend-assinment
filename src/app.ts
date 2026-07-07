import cookieParser from "cookie-parser";
import express, { Application, Request, Response } from "express";
import cors from "cors";
import config from "./config";
import { notFound } from "./middleware/notFound";
import { globalErrorHandler } from "./middleware/globalErrorHandlar";
import { AuthRoutes } from "./modules/auth/auth.route";


// Route imports


const app: Application = express();

// Middlewares
app.use(cors({
  origin: [
    "http://localhost:3000",
    "http://localhost:5173",
    config.app_url || "",
  ],
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Root
app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "FixItNow API is running!",
    version: "1.0.0",
  });
});

// Health
app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "Server is healthy",
    timestamp: new Date().toISOString(),
  });
});

// Auth
app.use("/api/auth", AuthRoutes);

// Public
// app.use("/api/categories", CategoryRoutes);
// app.use("/api/services", ServiceRoutes);
// app.use("/api/technicians", TechnicianRoutes);

// Customer
// app.use("/api/bookings", BookingRoutes);
// app.use("/api/payments", PaymentRoutes);
// app.use("/api/reviews", ReviewRoutes);

// Technician Management
// app.use("/api/technician", TechnicianManageRoutes);

// Admin
// app.use("/api/admin", AdminRoutes);

// Error Handlers
app.use(notFound);
app.use(globalErrorHandler);

export default app;