import { useState, useEffect } from "react";
import "../styles/InstructorDashboard.css";
import InstructorSidebar from "../components/InstructorSidebar";
import Topbar from "../components/Topbar";
import RecentActivities from "../components/RecentActivities";
import Footer from "../components/Footer";
import { useNavigate } from "react-router-dom";
import { authFetch } from "../utils/api";
import { useAuth } from "../context/AuthContext";

function InstructorDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [roster, setRoster] = useState([]);
  const [certificatesCount, setCertificatesCount] = useState(0);

  useEffect(() => {
    authFetch("/instructor/courses")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch courses");
        return res.json();
      })
      .then(async (data) => {
        setCourses(data);
        
        // Fetch students lists for all courses to populate student roster and certificates completed
        const studentLists = await Promise.all(
          data.map((c) =>
            authFetch(`/instructor/courses/${c.id}/students`)
              .then((res) => (res.ok ? res.json() : []))
              .then((students) => students.map((s) => ({ ...s, courseTitle: c.title, totalLessons: c.totalLessons })))
              .catch(() => [])
          )
        );

        // Flatten student lists
        const flatStudents = studentLists.flat();
        setRoster(flatStudents);

        // Count certificates (students who completed all lessons)
        const completedCount = flatStudents.filter(
          (s) => s.totalLessons > 0 && s.completedLessons === s.totalLessons
        ).length;
        setCertificatesCount(completedCount);
      })
      .catch((err) => {
        console.error(err);
        setError("Error loading instructor statistics.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const totalStudents = courses.reduce((sum, c) => sum + (c.students || 0), 0);

  return (
    <div className="instructor-dashboard">
      <InstructorSidebar />

      <div className="instructor-content">
        <Topbar />

        {/* HERO */}
        <div className="instructor-hero">
          <div>
            <span className="hero-tag">INSTRUCTOR COMMAND CENTER</span>
            <h1>Welcome Back, {user?.name || "Instructor"}</h1>
            <p>Manage courses, monitor student progress and track learning performance in real time.</p>
          </div>

          <div className="hero-circle">
            <h2>{totalStudents}</h2>
            <span>Students</span>
          </div>
        </div>

        {/* STATS */}
        <div className="instructor-stats">
          <div
            className="stat-card"
            onClick={() => navigate("/manage-courses")}
            style={{ cursor: "pointer" }}
          >
            <h2>{courses.length.toString().padStart(2, "0")}</h2>
            <p>Total Courses</p>
          </div>

          <div
            className="stat-card"
            onClick={() => navigate("/manage-students")}
            style={{ cursor: "pointer" }}
          >
            <h2>{totalStudents.toString().padStart(2, "0")}</h2>
            <p>Students Enrolled</p>
          </div>

          <div className="stat-card">
            <h2>{courses.reduce((sum, c) => sum + (c.modules || 0), 0).toString().padStart(2, "0")}</h2>
            <p>Total Lessons</p>
          </div>

          <div className="stat-card">
            <h2>{certificatesCount.toString().padStart(2, "0")}</h2>
            <p>Certificates Generated</p>
          </div>
        </div>

        {/* COURSE MANAGEMENT */}
        <div className="dashboard-section">
          <h2>Course Overview</h2>

          {loading ? (
            <p style={{ color: "var(--text-secondary)" }}>Loading courses data...</p>
          ) : error ? (
            <p style={{ color: "#f87171" }}>{error}</p>
          ) : courses.length === 0 ? (
            <p style={{ color: "var(--text-secondary)" }}>No courses created yet.</p>
          ) : (
            <div className="course-manage-grid">
              {courses.slice(0, 3).map((course) => (
                <div className="manage-card" key={course.id}>
                  <h3>{course.title}</h3>
                  <p>{course.students} Students</p>
                  <span>{course.modules} Modules</span>
                  <button onClick={() => navigate("/manage-courses")}>Edit Course</button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* QUICK ACTIONS */}
        <div className="quick-actions">
          <div className="quick-card">
            <h3>Create New Course</h3>
            <p>Add a new learning program.</p>
            <button onClick={() => navigate("/manage-courses")}>Create</button>
          </div>

          <div className="quick-card">
            <h3>Upload Content</h3>
            <p>Add videos, notes and assignments.</p>
            <button onClick={() => navigate("/manage-courses")}>Upload</button>
          </div>

          <div className="quick-card">
            <h3>View Reports</h3>
            <p>Check student performance analytics.</p>
            <button onClick={() => navigate("/instructor-analytics")}>View</button>
          </div>
        </div>

        {/* RECENT ACTIVITIES */}
        <RecentActivities />

        {/* TABLE + NOTIFICATIONS */}
        <div className="bottom-section">
          <div className="student-table">
            <h2>Student Performance</h2>
            {roster.length === 0 ? (
              <p style={{ color: "var(--text-secondary)", padding: "20px" }}>No enrolled student activity.</p>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Course</th>
                    <th>Progress</th>
                  </tr>
                </thead>
                <tbody>
                  {roster.slice(0, 5).map((student, idx) => {
                    const pct =
                      student.totalLessons > 0
                        ? ((student.completedLessons / student.totalLessons) * 100).toFixed(0)
                        : "0";
                    return (
                      <tr key={idx}>
                        <td>{student.name}</td>
                        <td>{student.courseTitle}</td>
                        <td>{pct}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          <div className="notification-box">
            <h2>🔔 Alerts</h2>
            {roster.length === 0 ? (
              <p style={{ color: "var(--text-secondary)", padding: "10px" }}>No active alerts.</p>
            ) : (
              roster.slice(0, 3).map((student, idx) => (
                <div className="notification" key={idx}>
                  <h4>New Activity</h4>
                  <p>
                    {student.name} completed {student.completedLessons} modules in {student.courseTitle}
                  </p>
                  <span>Recently</span>
                </div>
              ))
            )}
          </div>
        </div>

        <Footer />
      </div>
    </div>
  );
}

export default InstructorDashboard;