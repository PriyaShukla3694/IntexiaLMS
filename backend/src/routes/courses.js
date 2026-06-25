import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import auth from "../middleware/auth.js";
import validate from "../middleware/validate.js";


const router = Router();

const progressSchema = z.object({
  moduleId: z.number().int("moduleId must be an integer"),
  completed: z.boolean()
});


// GET ALL COURSES
router.get("/", async (req, res) => {
  try {
    const courses = await prisma.course.findMany({
      where: { approved: true },
      include: {
        modules: true
      }
    });
    res.json(courses);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error retrieving courses." });
  }
});

// GET USER'S ENROLLED COURSES
router.get("/enrolled", auth, async (req, res) => {
  try {
    const enrollments = await prisma.enrollment.findMany({
      where: { userId: req.user.id },
      include: {
        course: {
          include: {
            modules: true
          }
        }
      }
    });
    const courses = enrollments.map((e) => e.course);
    res.json(courses);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error retrieving enrolled courses." });
  }
});

// GET USER'S CERTIFICATES
router.get("/certificates", auth, async (req, res) => {
  try {
    const certificates = await prisma.certificate.findMany({
      where: { userId: req.user.id }
    });

    const certificatesWithCourses = await Promise.all(
      certificates.map(async (cert) => {
        const course = await prisma.course.findUnique({
          where: { id: cert.courseId },
          include: { modules: true }
        });
        return { ...cert, course };
      })
    );

    res.json(certificatesWithCourses);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error retrieving certificates." });
  }
});

// GET SINGLE COURSE BY ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const course = await prisma.course.findUnique({
      where: { id: parseInt(id) },
      include: {
        modules: true
      }
    });

    if (!course) {
      return res.status(404).json({ error: "Course not found." });
    }

    res.json(course);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error retrieving course details." });
  }
});

// ENROLL IN A COURSE
router.post("/:id/enroll", auth, async (req, res) => {
  try {
    const { id } = req.params;
    const courseId = parseInt(id);

    const course = await prisma.course.findUnique({
      where: { id: courseId }
    });

    if (!course) {
      return res.status(404).json({ error: "Course not found." });
    }

    const existingEnrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: req.user.id,
          courseId
        }
      }
    });

    if (existingEnrollment) {
      return res.status(400).json({ error: "Already enrolled in this course." });
    }

    // Enroll user and initialize progress
    await prisma.$transaction([
      prisma.enrollment.create({
        data: {
          userId: req.user.id,
          courseId
        }
      }),
      prisma.progress.create({
        data: {
          userId: req.user.id,
          courseId,
          completedLessons: 0
        }
      })
    ]);

    res.status(201).json({ message: "Successfully enrolled in course." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error during course enrollment." });
  }
});

// GET COURSE PROGRESS
router.get("/:id/progress", auth, async (req, res) => {
  try {
    const { id } = req.params;
    const courseId = parseInt(id);

    // Verify enrollment
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: req.user.id,
          courseId
        }
      }
    });

    if (!enrollment) {
      return res.json(null);
    }

    const completions = await prisma.moduleCompletion.findMany({
      where: {
        userId: req.user.id,
        module: { courseId }
      },
      select: {
        moduleId: true
      }
    });

    const completedModuleIds = completions.map((c) => c.moduleId);

    res.json({
      data: completedModuleIds,
      completedLessons: completedModuleIds.length
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error retrieving progress." });
  }
});

// UPDATE COURSE PROGRESS
router.post("/:id/progress", auth, validate(progressSchema), async (req, res) => {
  try {
    const { id } = req.params;
    const { moduleId, completed } = req.body;
    const courseId = parseInt(id);


    // Verify enrollment
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: req.user.id,
          courseId
        }
      }
    });

    if (!enrollment) {
      return res.status(400).json({ error: "User is not enrolled in this course." });
    }

    // Upsert or delete module completion
    if (completed) {
      await prisma.moduleCompletion.upsert({
        where: {
          userId_moduleId: {
            userId: req.user.id,
            moduleId: parseInt(moduleId)
          }
        },
        update: {
          completed: true
        },
        create: {
          userId: req.user.id,
          moduleId: parseInt(moduleId),
          completed: true
        }
      });
    } else {
      await prisma.moduleCompletion.deleteMany({
        where: {
          userId: req.user.id,
          moduleId: parseInt(moduleId)
        }
      });
    }

    // Get updated list of completed modules for this course
    const completions = await prisma.moduleCompletion.findMany({
      where: {
        userId: req.user.id,
        module: { courseId }
      },
      select: {
        moduleId: true
      }
    });

    const completedModuleIds = completions.map((c) => c.moduleId);

    // Sync to Progress model
    await prisma.progress.upsert({
      where: {
        userId_courseId: {
          userId: req.user.id,
          courseId
        }
      },
      update: {
        completedLessons: completedModuleIds.length
      },
      create: {
        userId: req.user.id,
        courseId,
        completedLessons: completedModuleIds.length
      }
    });

    // Check if course is fully completed
    const allModules = await prisma.module.findMany({
      where: { courseId }
    });

    if (completedModuleIds.length === allModules.length && allModules.length > 0) {
      // Auto-generate certificate if it does not exist
      const existingCert = await prisma.certificate.findFirst({
        where: {
          userId: req.user.id,
          courseId
        }
      });

      if (!existingCert) {
        await prisma.certificate.create({
          data: {
            userId: req.user.id,
            courseId
          }
        });
      }
    }

    res.json({
      data: completedModuleIds,
      completedLessons: completedModuleIds.length
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error updating progress." });
  }
});

export default router;
