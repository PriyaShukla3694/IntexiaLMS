import { useState, useEffect } from "react";
import "../styles/StudentDashboard.css";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import Footer from "../components/Footer";

import cyberSecurity from "../assets/Cyber_Security.jpeg";
import ethicalHacking from "../assets/Ethical_Hacking.jpeg";
import pythonAI from "../assets/Python.jpeg";
import trishul from "../assets/trishul.png";

import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCourses, useEnrolledCourses } from "../hooks/useCourses";
import { authFetch } from "../utils/api";

const getCourseImage = (id) => {
  const parsedId = id?.toString();
  if (parsedId === "1") return cyberSecurity;
  if (parsedId === "2") return ethicalHacking;
  if (parsedId === "3") return pythonAI;
  return trishul;
};

function StudentDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Dynamic course hooks
  const { courses, loading: coursesLoading } = useCourses();
  const { enrolledCourses, loading: enrolledLoading } = useEnrolledCourses();

  // Dynamic user stats state
  const [certificatesCount, setCertificatesCount] = useState(0);
  const [courseProgressMap, setCourseProgressMap] = useState({}); // { courseId: completedLessonsCount }
  const [statsLoading, setStatsLoading] = useState(true);

  // Guided Tour State
  const [tourStep, setTourStep] = useState(-1);

  // Fetch certificates on mount
  useEffect(() => {
    authFetch("/courses/certificates")
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error();
      })
      .then((data) => setCertificatesCount(data ? data.length : 0))
      .catch((err) => console.error("Error loading certificates:", err));

    // Show onboarding tour automatically if not completed before
    const completed = localStorage.getItem("lms_tour_completed");
    if (!completed) {
      const timer = setTimeout(() => {
        setTourStep(0);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  // Fetch detailed completions progress for all enrolled courses
  useEffect(() => {
    if (enrolledLoading) return;

    if (enrolledCourses.length === 0) {
      setCourseProgressMap({});
      setStatsLoading(false);
      return;
    }

    Promise.all(
      enrolledCourses.map((c) =>
        authFetch(`/courses/${c.id}/progress`)
          .then((res) => {
            if (res.ok) return res.json();
            return { completedLessons: 0 };
          })
          .then((data) => ({ courseId: c.id, completedCount: data ? data.completedLessons : 0 }))
          .catch(() => ({ courseId: c.id, completedCount: 0 }))
      )
    )
      .then((results) => {
        const progressMap = {};
        results.forEach((res) => {
          progressMap[res.courseId] = res.completedCount;
        });
        setCourseProgressMap(progressMap);
        setStatsLoading(false);
      })
      .catch((err) => {
        console.error("Error loading progress aggregators:", err);
        setStatsLoading(false);
      });
  }, [enrolledCourses, enrolledLoading]);

  // Aggregate user statistics
  const totalCompletedLessons = Object.values(courseProgressMap).reduce((a, b) => a + b, 0);
  const totalCourseLessons = enrolledCourses.reduce((sum, c) => sum + (c.totalLessons || 0), 0);
  
  const overallProgressPct =
    totalCourseLessons > 0 ? ((totalCompletedLessons / totalCourseLessons) * 100).toFixed(0) : "0";
  
  const computedXP = totalCompletedLessons * 100;
  const computedHours = (totalCompletedLessons * 1.5).toFixed(1);
  const computedStreak = totalCompletedLessons > 0 ? 1 + Math.floor(totalCompletedLessons / 2) : 0;

  const getCourseProgressPercentage = (courseId) => {
    const enrolled = enrolledCourses.find((c) => c.id === courseId);
    if (!enrolled) return null;
    const completed = courseProgressMap[courseId] || 0;
    const total = enrolled.totalLessons || 0;
    return total > 0 ? ((completed / total) * 100).toFixed(0) : "0";
  };

  // Onboarding Guided steps
  const tourGuides = [
    {
      title: "🛡 Welcome to Shourya CommandCenter!",
      desc: "Welcome to Shourya Cybersecurity Academy! This is your control center where you can view your total experience points (XP), active learning streak, and progress across all enrolled tracks.",
    },
    {
      title: "📚 Browse Platform Courses",
      desc: "Scroll down to browse all of our active cybersecurity and programming tracks. Click on any course to see its dynamic curriculum, modules list, and expert instructor guides.",
    },
    {
      title: "⚡ Single-Click Enrollment",
      desc: "Inside any course details page, click 'Enroll in Course' to immediately unlock the modules, set up your learning progress tracker, and start studying.",
    },
    {
      title: "🎥 Learn and Mark Completed",
      desc: "Click 'Start Learning' to play dynamic video lectures, review course cheat sheets, and check off completed lesson modules to advance your learning progress.",
    },
    {
      title: "🏆 Download Verified PDFs",
      desc: "Once you hit 100% completion in a course, a secure certificate of completion is auto-generated. Go to 'My Certificates' in the sidebar to download it as a high-quality PDF!",
    },
  ];

  const handleNextStep = () => {
    if (tourStep < 4) {
      setTourStep((prev) => prev + 1);
    } else {
      localStorage.setItem("lms_tour_completed", "true");
      setTourStep(-1);
    }
  };

  const handleSkipTour = () => {
    localStorage.setItem("lms_tour_completed", "true");
    setTourStep(-1);
  };

  const handleRestartTour = () => {
    setTourStep(0);
  };

  return (
    <div className="student-dashboard">
      <Sidebar />

      <div className="main-content">
        <Topbar />

        <div className="command-center">
          <div className="command-left">
            <span className="warrior-tag">
              ⚔ CYBER RECRUIT • LEVEL {totalCompletedLessons > 0 ? 1 + Math.floor(totalCompletedLessons / 3) : 1}
            </span>

            <h1>
              Welcome Back,
              <br />
              <span className="student-name">{user?.name || "Student"}</span>
            </h1>

            <p>
              Continue mastering cybersecurity, ethical hacking and AI. Your next achievement is waiting. Take a tour to learn how to operate!
            </p>

            <div className="xp-box">
              <div>
                <h3>{computedXP} XP</h3>
                <span>Total Experience</span>
              </div>

              <div>
                <h3>{overallProgressPct}%</h3>
                <span>Course Progress</span>
              </div>
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              <button className="continue-btn" onClick={() => navigate("/my-courses")}>
                Continue Learning →
              </button>
              <button
                className="continue-btn"
                onClick={handleRestartTour}
                style={{ background: "rgba(196,138,82,0.25)", color: "#C48A52", border: "1px solid #C48A52" }}
              >
                Start Platform Tour 🧭
              </button>
            </div>
          </div>

          <div className="command-right">
            <img src={cyberSecurity} alt="Cyber Security" />
          </div>
        </div>

        <div className="stats-row">
          <div className="premium-stat">
            <h2>{enrolledCourses.length.toString().padStart(2, "0")}</h2>
            <p>Active Courses</p>
          </div>

          <div className="premium-stat">
            <h2>{computedStreak.toString().padStart(2, "0")}</h2>
            <p>Day Streak</p>
          </div>

          <div className="premium-stat">
            <h2>{certificatesCount.toString().padStart(2, "0")}</h2>
            <p>Certificates</p>
          </div>

          <div className="premium-stat">
            <h2>{computedHours}</h2>
            <p>Learning Hours</p>
          </div>
        </div>

        <div className="dashboard-block">
          <div className="section-head">
            <h2>Explore Courses</h2>
            <span style={{ cursor: "pointer" }} onClick={() => navigate("/my-courses")}>View Enrolled</span>
          </div>

          <div className="course-grid">
            {coursesLoading ? (
              <p style={{ color: "var(--text-secondary)" }}>Loading courses from system...</p>
            ) : (
              courses.slice(0, 3).map((course) => {
                const progressPct = getCourseProgressPercentage(course.id);
                return (
                  <div
                    key={course.id}
                    className="course-card"
                    onClick={() => navigate(`/course/${course.id}`)}
                    style={{ cursor: "pointer" }}
                  >
                    <img src={getCourseImage(course.id)} alt={course.title} />

                    <div className="course-content">
                      <h3>{course.title}</h3>
                      <p>{course.totalLessons} Lessons</p>
                      {progressPct !== null ? (
                        <>
                          <div className="mini-progress" style={{ margin: "10px 0 6px 0" }}>
                            <div style={{ width: `${progressPct}%` }}></div>
                          </div>
                          <span style={{ fontSize: "11px", color: "#C48A52", fontWeight: "600" }}>
                            Enrolled: {progressPct}% Done
                          </span>
                        </>
                      ) : (
                        <span style={{ fontSize: "11px", color: "#a1a1aa", display: "block", marginTop: "10px" }}>
                          Not Enrolled (Explore details)
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="bottom-grid">
          <div className="activity-box">
            <h2>Recent Activity</h2>
            <div className="timeline">
              {totalCompletedLessons > 0 ? (
                <>
                  <p>✅ Completed {totalCompletedLessons} lecture modules</p>
                  <p>🏆 Earned {computedXP} platform experience points</p>
                  <p>🔥 {computedStreak} Day Learning Streak</p>
                </>
              ) : (
                <p style={{ color: "#a1a1aa" }}>No recent activity. Start learning to record milestones!</p>
              )}
            </div>
          </div>

          <div className="achievement-box">
            <h2>Achievements</h2>
            {totalCompletedLessons > 0 ? (
              <>
                <div className="badge">🥇 Cyber Warrior</div>
                {totalCompletedLessons >= 3 && <div className="badge">🔥 Consistency Master</div>}
                {certificatesCount > 0 && <div className="badge">🏆 Elite Graduate</div>}
              </>
            ) : (
              <p style={{ color: "#a1a1aa" }}>Unlock badges by completing courses and modules!</p>
            )}
          </div>
        </div>

        <Footer />
      </div>

      {/* Guided Platform Tour Popup */}
      {tourStep >= 0 && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(10, 15, 29, 0.8)",
            backdropFilter: "blur(4px)",
            zIndex: 99999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
        >
          <div
            style={{
              maxWidth: "500px",
              background: "#12121a",
              border: "2px solid #C48A52",
              borderRadius: "20px",
              padding: "30px",
              boxShadow: "0 15px 50px rgba(0, 0, 0, 0.6)",
              textAlign: "center",
            }}
          >
            <h2 style={{ color: "#C48A52", marginBottom: "15px", fontSize: "24px", fontWeight: "700" }}>
              {tourGuides[tourStep].title}
            </h2>
            <p style={{ color: "#cbd5e1", fontSize: "15px", lineHeight: "1.6", marginBottom: "25px" }}>
              {tourGuides[tourStep].desc}
            </p>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <button
                onClick={handleSkipTour}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#6b7280",
                  cursor: "pointer",
                  fontWeight: "600",
                  fontSize: "14px",
                }}
              >
                Skip Tour
              </button>
              <div style={{ display: "flex", gap: "6px" }}>
                {[0, 1, 2, 3, 4].map((idx) => (
                  <div
                    key={idx}
                    style={{
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      background: idx === tourStep ? "#C48A52" : "#374151",
                    }}
                  ></div>
                ))}
              </div>
              <button
                onClick={handleNextStep}
                style={{
                  background: "#C48A52",
                  border: "none",
                  color: "#fff",
                  padding: "10px 20px",
                  borderRadius: "8px",
                  fontWeight: "600",
                  cursor: "pointer",
                  fontSize: "14px",
                }}
              >
                {tourStep === 4 ? "Get Started ✓" : "Next Step →"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default StudentDashboard;