import { useState, useEffect } from "react";
import "../styles/MyCourses.css";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import Footer from "../components/Footer";
import { useNavigate } from "react-router-dom";
import { useEnrolledCourses } from "../hooks/useCourses";
import { authFetch } from "../utils/api";

import cyberSecurity from "../assets/Cyber_Security.jpeg";
import ethicalHacking from "../assets/Ethical_Hacking.jpeg";
import pythonAI from "../assets/Python.jpeg";
import trishul from "../assets/trishul.png";

const getCourseImage = (id) => {
  const parsedId = id?.toString();
  if (parsedId === "1") return cyberSecurity;
  if (parsedId === "2") return ethicalHacking;
  if (parsedId === "3") return pythonAI;
  return trishul;
};

function MyCourses() {
  const navigate = useNavigate();
  const { enrolledCourses, loading } = useEnrolledCourses();

  // Dynamic user stats state
  const [certificatesCount, setCertificatesCount] = useState(0);
  const [courseProgressMap, setCourseProgressMap] = useState({}); // { courseId: completedLessonsCount }
  const [statsLoading, setStatsLoading] = useState(true);

  // Fetch certificates count on mount
  useEffect(() => {
    authFetch("/courses/certificates")
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error();
      })
      .then((data) => setCertificatesCount(data ? data.length : 0))
      .catch((err) => console.error("Error loading certificates:", err));
  }, []);

  // Fetch detailed completions progress for all enrolled courses
  useEffect(() => {
    if (loading) return;

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
  }, [enrolledCourses, loading]);

  // Aggregate user statistics
  const totalCompletedLessons = Object.values(courseProgressMap).reduce((a, b) => a + b, 0);
  const totalCourseLessons = enrolledCourses.reduce((sum, c) => sum + (c.totalLessons || 0), 0);

  const averageProgressPct =
    totalCourseLessons > 0 ? Math.round((totalCompletedLessons / totalCourseLessons) * 100) : 0;

  const computedHours = (totalCompletedLessons * 1.5).toFixed(1);

  return (
    <div className="student-dashboard">
      <Sidebar />

      <div className="main-content">
        <Topbar />

        {/* HEADER */}
        <div className="courses-header">
          <div>
            <span className="courses-tag">
              LEARNING PATH
            </span>
            <h1 className="page-title">
              My Courses
            </h1>
            <p>
              Continue your enrolled courses and track your learning journey.
            </p>
          </div>

          <div className="course-count">
            <h2>{enrolledCourses.length.toString().padStart(2, "0")}</h2>
            <span>Active Courses</span>
          </div>
        </div>

        {/* SEARCH */}
        <input
          type="text"
          className="course-search"
          placeholder="Search your courses..."
        />

        {/* STATS */}
        <div className="learning-stats">
          <div className="learning-card">
            <h2>{computedHours}</h2>
            <p>Learning Hours</p>
          </div>

          <div className="learning-card">
            <h2>{averageProgressPct}%</h2>
            <p>Average Progress</p>
          </div>

          <div className="learning-card">
            <h2>{certificatesCount.toString().padStart(2, "0")}</h2>
            <p>Certificates Earned</p>
          </div>
        </div>

        {/* COURSES */}
        <div className="course-grid">
          {loading ? (
            <p style={{ color: "var(--text-secondary)" }}>Loading enrolled courses...</p>
          ) : enrolledCourses.length === 0 ? (
            <div style={{ color: "var(--text-secondary)", gridColumn: "1 / -1", textAlign: "center", padding: "40px" }}>
              <h3>You are not enrolled in any courses yet.</h3>
              <button 
                onClick={() => navigate("/student-dashboard")}
                style={{
                  marginTop: "20px",
                  padding: "10px 20px",
                  background: "var(--accent-glow)",
                  border: "none",
                  color: "#fff",
                  borderRadius: "5px",
                  cursor: "pointer"
                }}
              >
                Explore Courses
              </button>
            </div>
          ) : (
            enrolledCourses.map((course) => (
              <div
                key={course.id}
                className="course-card"
                onClick={() => navigate(`/course/${course.id}`)}
              >
                <div className="course-image">
                  <img
                    src={getCourseImage(course.id)}
                    alt={course.title}
                  />
                  <span className="course-badge">
                    {course.difficulty}
                  </span>
                </div>

                <div className="course-content">
                  <h3>{course.title}</h3>
                  <p>{course.description}</p>

                  <div className="course-meta">
                    <span>{course.totalLessons} Lessons</span>
                    <span>{course.duration}</span>
                  </div>

                  <div className="course-status">
                    Enrolled
                  </div>

                  <button>
                    Continue Learning →
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <Footer />
      </div>
    </div>
  );
}

export default MyCourses;