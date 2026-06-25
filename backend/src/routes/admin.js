import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import auth from "../middleware/auth.js";
import validate from "../middleware/validate.js";


const router = Router();

const roleSchema = z.object({
  role: z.enum(["STUDENT", "INSTRUCTOR", "ADMIN"], {
    errorMap: () => ({ message: "Invalid role value. Must be STUDENT, INSTRUCTOR, or ADMIN." })
  })
});

const approveSchema = z.object({
  approved: z.boolean({
    required_error: "approved status is required.",
    invalid_type_error: "approved status must be a boolean."
  })
});


// Middleware to require ADMIN role
function requireAdmin(req, res, next) {
  if (req.user && req.user.role === "ADMIN") {
    next();
  } else {
    res.status(403).json({ error: "Access denied. Admin role required." });
  }
}

// GET ALL USERS
router.get("/users", auth, requireAdmin, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        mobile: true,
        createdAt: true
      }
    });
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error retrieving users." });
  }
});

// UPDATE USER ROLE
router.patch("/users/:id/role", auth, requireAdmin, validate(roleSchema), async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body; // e.g. "STUDENT", "INSTRUCTOR", "ADMIN"


    const updatedUser = await prisma.user.update({
      where: { id: parseInt(id) },
      data: { role },
      select: {
        id: true,
        name: true,
        email: true,
        role: true
      }
    });
    res.json(updatedUser);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error updating user role." });
  }
});

// DELETE USER
router.delete("/users/:id", auth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = parseInt(id);

    if (userId === req.user.id) {
      return res.status(400).json({ error: "You cannot delete your own account." });
    }

    await prisma.$transaction([
      prisma.moduleCompletion.deleteMany({ where: { userId } }),
      prisma.progress.deleteMany({ where: { userId } }),
      prisma.enrollment.deleteMany({ where: { userId } }),
      prisma.certificate.deleteMany({ where: { userId } }),
      prisma.user.delete({ where: { id: userId } })
    ]);

    res.json({ message: "User deleted successfully." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error deleting user." });
  }
});

// GET PENDING COURSES
router.get("/courses/pending", auth, requireAdmin, async (req, res) => {
  try {
    const courses = await prisma.course.findMany({
      where: { approved: false },
      include: {
        modules: true
      }
    });
    res.json(courses);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error retrieving pending courses." });
  }
});

// APPROVE/REJECT COURSE
router.patch("/courses/:id/approve", auth, requireAdmin, validate(approveSchema), async (req, res) => {
  try {
    const { id } = req.params;
    const { approved } = req.body; // boolean: true to approve, false to reject


    const course = await prisma.course.update({
      where: { id: parseInt(id) },
      data: { approved: !!approved }
    });

    res.json(course);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error updating course approval status." });
  }
});

// PLATFORM ANALYTICS
router.get("/analytics", auth, requireAdmin, async (req, res) => {
  try {
    const totalUsers = await prisma.user.count();
    const totalStudents = await prisma.user.count({ where: { role: "STUDENT" } });
    const totalInstructors = await prisma.user.count({ where: { role: "INSTRUCTOR" } });
    const totalCourses = await prisma.course.count();
    const totalEnrollments = await prisma.enrollment.count();
    const totalCertificates = await prisma.certificate.count();

    res.json({
      totalUsers,
      totalStudents,
      totalInstructors,
      totalCourses,
      totalEnrollments,
      totalCertificates
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error retrieving platform analytics." });
  }
});

export default router;
