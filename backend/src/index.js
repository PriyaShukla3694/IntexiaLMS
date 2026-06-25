import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import authRoutes from "./routes/auth.js";
import courseRoutes from "./routes/courses.js";
import instructorRoutes from "./routes/instructor.js";
import adminRoutes from "./routes/admin.js";
import errorHandler from "./middleware/errorHandler.js";
import morgan from "morgan";



dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Apply Helmet security headers
app.use(helmet());

// Log HTTP requests
app.use(morgan("dev"));


// Dynamic CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true
}));

app.use(express.json());

// Rate Limiter for Authentication routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15, // 15 attempts per IP
  message: { error: "Too many attempts, try again later." }
});
app.use("/api/auth", authLimiter, authRoutes);

app.use("/api/courses", courseRoutes);
app.use("/api/instructor", instructorRoutes);
app.use("/api/admin", adminRoutes);

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

// Global error handling middleware
app.use(errorHandler);


app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
