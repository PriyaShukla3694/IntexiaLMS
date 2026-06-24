import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  // 1. Seed Predefined Users
  const users = [
    { name: "Admin User", email: "admin@lms.com", password: "Admin@123", role: "ADMIN" },
    { name: "Instructor User", email: "teacher@lms.com", password: "Teach@123", role: "INSTRUCTOR" },
    { name: "Student User", email: "student@lms.com", password: "Learn@123", role: "STUDENT" }
  ];

  for (const u of users) {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(u.password, salt);
    await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: {
        name: u.name,
        email: u.email,
        passwordHash,
        role: u.role
      }
    });
  }

  // 2. Seed Predefined Courses and Modules
  const courses = [
    {
      id: 1,
      title: "Cyber Security Basics",
      tag: "CYBER SECURITY TRACK",
      description: "Learn cybersecurity fundamentals, networking concepts, ethical hacking, penetration testing and defense systems.",
      difficulty: "Advanced",
      duration: "12 Hours",
      totalLessons: 24,
      instructor: "Shourya Cyber Academy",
      modules: [
        { title: "Introduction To Cyber Security", duration: "2 Hours" },
        { title: "Networking Fundamentals", duration: "2 Hours" },
        { title: "Security Concepts", duration: "2 Hours" },
        { title: "Ethical Hacking", duration: "2 Hours" },
        { title: "Penetration Testing", duration: "2 Hours" },
        { title: "Final Assessment", duration: "2 Hours" }
      ]
    },
    {
      id: 2,
      title: "Ethical Hacking",
      tag: "PENETRATION TESTING TRACK",
      description: "Learn penetration testing, vulnerability assessment and ethical hacking methodologies.",
      difficulty: "Intermediate",
      duration: "8 Hours",
      totalLessons: 18,
      instructor: "Shourya Cyber Academy",
      modules: [
        { title: "Introduction to Ethical Hacking", duration: "1.5 Hours" },
        { title: "Footprinting & Reconnaissance", duration: "1.5 Hours" },
        { title: "Scanning Networks", duration: "1 Hour" },
        { title: "Vulnerability Analysis", duration: "1 Hour" },
        { title: "System Hacking", duration: "1.5 Hours" },
        { title: "Web Application Hacking", duration: "1.5 Hours" }
      ]
    },
    {
      id: 3,
      title: "Python For AI",
      tag: "AI & PROGRAMMING TRACK",
      description: "Build AI applications using Python, Machine Learning and Deep Learning tools.",
      difficulty: "Beginner",
      duration: "15 Hours",
      totalLessons: 30,
      instructor: "Shourya Cyber Academy",
      modules: [
        { title: "Python Programming Essentials", duration: "3 Hours" },
        { title: "Data Analysis with Python", duration: "2.5 Hours" },
        { title: "Intro to Machine Learning", duration: "2.5 Hours" },
        { title: "Supervised & Unsupervised Learning", duration: "2.5 Hours" },
        { title: "Neural Networks & Deep Learning", duration: "2.5 Hours" },
        { title: "Building AI Projects", duration: "2 Hours" }
      ]
    }
  ];

  const instructorUser = await prisma.user.findUnique({
    where: { email: "teacher@lms.com" }
  });
  const instructorId = instructorUser ? instructorUser.id : null;

  for (const c of courses) {
    const createdCourse = await prisma.course.upsert({
      where: { id: c.id },
      update: {
        title: c.title,
        tag: c.tag,
        description: c.description,
        difficulty: c.difficulty,
        duration: c.duration,
        totalLessons: c.totalLessons,
        instructor: c.instructor,
        instructorId: instructorId,
        approved: true
      },
      create: {
        title: c.title,
        tag: c.tag,
        description: c.description,
        difficulty: c.difficulty,
        duration: c.duration,
        totalLessons: c.totalLessons,
        instructor: c.instructor,
        instructorId: instructorId,
        approved: true
      }
    });

    // Delete existing modules for this course to avoid duplicate entries when re-running seed
    await prisma.module.deleteMany({
      where: { courseId: createdCourse.id }
    });

    for (const m of c.modules) {
      await prisma.module.create({
        data: {
          title: m.title,
          duration: m.duration,
          courseId: createdCourse.id
        }
      });
    }
  }

  console.log("Database seeded successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
