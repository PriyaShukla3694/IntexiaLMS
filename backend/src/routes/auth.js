import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma.js";

const router = Router();


// REGISTER
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, mobile } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "Please provide name, email, and password." });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Input Validation
    if (password.length < 8) {
      return res.status(400).json({ error: "Password must be at least 8 characters long." });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      return res.status(400).json({ error: "Invalid email format." });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail }
    });

    if (existingUser) {
      return res.status(400).json({ error: "User already exists with this email." });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        passwordHash,
        mobile: mobile ? mobile.trim() : null,
        role: "STUDENT"
      }
    });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || "cyber-lms-super-secret-key-change-me",
      { expiresIn: "7d" }
    );

    res.status(201).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        mobile: user.mobile
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error during registration." });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Please provide email and password." });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Input Validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      return res.status(400).json({ error: "Invalid email format." });
    }

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail }
    });

    if (!user) {
      return res.status(400).json({ error: "Invalid credentials." });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid credentials." });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || "cyber-lms-super-secret-key-change-me",
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        mobile: user.mobile
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error during login." });
  }
});

export default router;
