import { useState, useEffect } from "react";
import "../styles/AdminDashboard.css";
import AdminSidebar from "../components/AdminSidebar";
import Topbar from "../components/Topbar";
import RecentActivities from "../components/RecentActivities";
import Footer from "../components/Footer";
import { useNavigate } from "react-router-dom";
import { authFetch } from "../utils/api";
import { useAuth } from "../context/AuthContext";

function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // Fetch platform analytics
    const fetchAnalytics = authFetch("/admin/analytics")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setStats(data))
      .catch((err) => console.error("Error loading admin stats:", err));

    // Fetch pending courses count
    const fetchPending = authFetch("/admin/courses/pending")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setPendingCount(data ? data.length : 0))
      .catch((err) => console.error("Error loading pending approvals:", err));

    Promise.all([fetchAnalytics, fetchPending])
      .catch((err) => {
        console.error(err);
        setError("Error loading admin command center.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <div className="admin-dashboard">
      <AdminSidebar />

      <div className="admin-content">
        <Topbar />

        {/* HERO */}
        <div className="admin-hero">
          <div>
            <span>PLATFORM CONTROL CENTER</span>
            <h1>Welcome, {user?.name || "Admin"}</h1>
            <p>Monitor users, courses, pending submissions and platform performance metrics.</p>
          </div>

          <div className="admin-circle">
            <h2>99%</h2>
            <span>System Health</span>
          </div>
        </div>

        {/* STATS */}
        <div className="admin-stats">
          <div className="admin-card" style={{ cursor: "pointer" }} onClick={() => navigate("/user-management")}>
            <h2>{loading ? "..." : stats ? stats.totalStudents : 0}</h2>
            <p>Students</p>
          </div>

          <div className="admin-card" style={{ cursor: "pointer" }} onClick={() => navigate("/user-management")}>
            <h2>{loading ? "..." : stats ? stats.totalInstructors : 0}</h2>
            <p>Instructors</p>
          </div>

          <div className="admin-card" style={{ cursor: "pointer" }} onClick={() => navigate("/course-approval")}>
            <h2>{loading ? "..." : stats ? stats.totalCourses : 0}</h2>
            <p>Total Courses</p>
          </div>

          <div className="admin-card" style={{ cursor: "pointer" }} onClick={() => navigate("/course-approval")}>
            <h2>{loading ? "..." : pendingCount}</h2>
            <p>Pending Approvals</p>
          </div>
        </div>

        {/* SYSTEM STATUS */}
        <div className="system-status">
          <div className="status-card">
            <h3>🟢 Database</h3>
            <p>PostgreSQL Online</p>
          </div>

          <div className="status-card">
            <h3>🟢 Engines</h3>
            <p>Prisma Client Active</p>
          </div>

          <div className="status-card">
            <h3>🟢 Security</h3>
            <p>Rate Limiter Active</p>
          </div>
        </div>

        {/* QUICK ACTIONS */}
        <div className="quick-actions">
          <div className="quick-card">
            <h3>User Management</h3>
            <p>View, update roles and manage registered users.</p>
            <button onClick={() => navigate("/user-management")}>Manage Users</button>
          </div>

          <div className="quick-card">
            <h3>Course Approval</h3>
            <p>Review and approve pending course proposals.</p>
            <button onClick={() => navigate("/course-approval")}>Review Courses</button>
          </div>

          <div className="quick-card">
            <h3>Platform Analytics</h3>
            <p>Monitor platform usage stats and growth metrics.</p>
            <button onClick={() => navigate("/platform-analytics")}>View Analytics</button>
          </div>
        </div>

        {/* RECENT ACTIVITIES */}
        <RecentActivities />

        <Footer />
      </div>
    </div>
  );
}

export default AdminDashboard;