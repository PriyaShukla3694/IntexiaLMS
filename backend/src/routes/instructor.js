import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import auth from "../middleware/auth.js";
import validate from "../middleware/validate.js";


const router = Router();

const courseSchema = z.object({
  title: z.string().trim().min(1, "Course title is required."),
  description: z.string().trim().optional(),
  tag: z.string().trim().optional(),
  difficulty: z.string().trim().optional(),
  duration: z.string().trim().optional(),
  totalLessons: z.number().int().optional(),
  instructor: z.string().trim().optional()
});

const moduleSchema = z.object({
  title: z.string().trim().min(1, "Module title is required."),
  duration: z.string().trim().optional()
});


// Middleware to require INSTRUCTOR role
function requireInstructor(req, res, next) {
  if (req.user && req.user.role === "INSTRUCTOR") {
    next();
  } else {
    res.status(403).json({ error: "Access denied. Instructor role required." });
  }
}

// GET ALL COURSES BY THIS INSTRUCTOR
router.get("/courses", auth, requireInstructor, async (req, res) => {
  try {
    const courses = await prisma.course.findMany({
      where: { instructorId: req.user.id },
      include: {
        modules: true,
        enrollments: true
      }
    });
    
    // Map to include enrollment counts
    const mappedCourses = courses.map(course => ({
      id: course.id,
      title: course.title,
      description: course.description,
      tag: course.tag,
      difficulty: course.difficulty,
      duration: course.duration,
      totalLessons: course.totalLessons,
      instructor: course.instructor,
      approved: course.approved,
      students: course.enrollments.length,
      modules: course.modules.length
    }));
    
    res.json(mappedCourses);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error retrieving instructor courses." });
  }
});

// CREATE COURSE
router.post("/courses", auth, requireInstructor, validate(courseSchema), async (req, res) => {
  try {
    const { title, description, tag, difficulty, duration, totalLessons, instructor } = req.body;


    const course = await prisma.course.create({
      data: {
        title,
        description: description || "No description provided.",
        tag: tag || "CYBER SECURITY",
        difficulty: difficulty || "Beginner",
        duration: duration || "0 Hours",
        totalLessons: totalLessons ? parseInt(totalLessons) : 0,
        instructor: instructor || req.user.name,
        instructorId: req.user.id,
        approved: false // requires admin approval
      }
    });
    res.status(201).json(course);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error creating course." });
  }
});

// EDIT COURSE
router.put("/courses/:id", auth, requireInstructor, validate(courseSchema), async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, tag, difficulty, duration, totalLessons, instructor } = req.body;


    const existingCourse = await prisma.course.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingCourse) {
      return res.status(404).json({ error: "Course not found." });
    }

    // Check ownership
    if (existingCourse.instructorId !== req.user.id) {
      return res.status(403).json({ error: "Forbidden. You do not own this course." });
    }

    const course = await prisma.course.update({
      where: { id: parseInt(id) },
      data: {
        title,
        description: description || "No description provided.",
        tag: tag || "CYBER SECURITY",
        difficulty: difficulty || "Beginner",
        duration: duration || "0 Hours",
        totalLessons: totalLessons ? parseInt(totalLessons) : undefined,
        instructor: instructor || req.user.name
      }
    });
    res.json(course);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error updating course." });
  }
});

// DELETE COURSE
router.delete("/courses/:id", auth, requireInstructor, async (req, res) => {
  try {
    const { id } = req.params;
    const courseId = parseInt(id);
    
    const existingCourse = await prisma.course.findUnique({
      where: { id: courseId }
    });

    if (!existingCourse) {
      return res.status(404).json({ error: "Course not found." });
    }

    // Check ownership
    if (existingCourse.instructorId !== req.user.id) {
      return res.status(403).json({ error: "Forbidden. You do not own this course." });
    }

    await prisma.$transaction([
      prisma.moduleCompletion.deleteMany({
        where: { module: { courseId } }
      }),
      prisma.module.deleteMany({
        where: { courseId }
      }),
      prisma.enrollment.deleteMany({
        where: { courseId }
      }),
      prisma.progress.deleteMany({
        where: { courseId }
      }),
      prisma.certificate.deleteMany({
        where: { courseId }
      }),
      prisma.course.delete({
        where: { id: courseId }
      })
    ]);
    
    res.json({ message: "Course deleted successfully." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error deleting course." });
  }
});

// ADD MODULE TO COURSE
router.post("/courses/:id/modules", auth, requireInstructor, validate(moduleSchema), async (req, res) => {
  try {
    const { id } = req.params;
    const { title, duration } = req.body;
    const courseId = parseInt(id);


    const existingCourse = await prisma.course.findUnique({
      where: { id: courseId }
    });

    if (!existingCourse) {
      return res.status(404).json({ error: "Course not found." });
    }

    // Check ownership
    if (existingCourse.instructorId !== req.user.id) {
      return res.status(403).json({ error: "Forbidden. You do not own this course." });
    }

    const module = await prisma.module.create({
      data: {
        title,
        duration: duration || "1 Hour",
        courseId
      }
    });

    // Update totalLessons in course
    const modulesCount = await prisma.module.count({
      where: { courseId }
    });

    await prisma.course.update({
      where: { id: courseId },
      data: { totalLessons: modulesCount }
    });

    res.status(201).json(module);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error creating module." });
  }
});

// GET ENROLLED STUDENTS LIST
router.get("/courses/:id/students", auth, requireInstructor, async (req, res) => {
  try {
    const { id } = req.params;
    const courseId = parseInt(id);

    const existingCourse = await prisma.course.findUnique({
      where: { id: courseId }
    });

    if (!existingCourse) {
      return res.status(404).json({ error: "Course not found." });
    }

    // Check ownership
    if (existingCourse.instructorId !== req.user.id) {
      return res.status(403).json({ error: "Forbidden. You do not own this course." });
    }

    const enrollments = await prisma.enrollment.findMany({
      where: { courseId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            mobile: true,
            progress: {
              where: { courseId }
            }
          }
        }
      }
    });

    const students = enrollments.map(e => {
      const progressObj = e.user.progress[0];
      return {
        id: e.user.id,
        name: e.user.name,
        email: e.user.email,
        mobile: e.user.mobile,
        completedLessons: progressObj ? progressObj.completedLessons : 0,
        enrolledAt: e.enrolledAt
      };
    });

    res.json(students);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error retrieving students." });
  }
});

export default router;
