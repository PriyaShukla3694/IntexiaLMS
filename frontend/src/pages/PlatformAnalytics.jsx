import { useState, useEffect } from "react";
import "../styles/AdminPages.css";
import AdminSidebar from "../components/AdminSidebar";
import Topbar from "../components/Topbar";
import { authFetch } from "../utils/api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function PlatformAnalytics() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    authFetch("/admin/analytics")
      .then((res) => {
        if (!res.ok) throw new Error("Could not load platform analytics");
        return res.json();
      })
      .then((data) => {
        setAnalytics(data);
      })
      .catch((err) => {
        console.error(err);
        setError("Error fetching admin platform metrics.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // Standard chart fallback data, but we can augment it with our live statistics!
  const getChartData = () => {
    if (!analytics) return [];
    return [
      { name: "Students", count: analytics.totalStudents },
      { name: "Instructors", count: analytics.totalInstructors },
      { name: "Courses", count: analytics.totalCourses },
      { name: "Enrollments", count: analytics.totalEnrollments },
      { name: "Certificates", count: analytics.totalCertificates },
    ];
  };

  return (
    <div className="admin-page">
      <AdminSidebar />

      <div className="admin-main">
        <Topbar />

        <h1 className="page-title">Platform Analytics</h1>

        {loading ? (
          <div style={{ color: "var(--text-secondary)", textAlign: "center", padding: "40px" }}>
            <h3>Loading platform reports...</h3>
          </div>
        ) : error ? (
          <div style={{ color: "#f87171", textAlign: "center", padding: "40px" }}>
            <h3>{error}</h3>
          </div>
        ) : (
          <>
            <div className="analytics-grid">
              <div className="analytics-card">
                <h2>{analytics.totalStudents}</h2>
                <p>Total Students</p>
              </div>

              <div className="analytics-card">
                <h2>{analytics.totalInstructors}</h2>
                <p>Total Instructors</p>
              </div>

              <div className="analytics-card">
                <h2>{analytics.totalCourses}</h2>
                <p>Total Courses</p>
              </div>

              <div className="analytics-card">
                <h2>{analytics.totalCertificates}</h2>
                <p>Certificates Earned</p>
              </div>
            </div>

            <div className="chart-container" style={{ marginTop: "30px" }}>
              <h2>System Resource Distribution</h2>

              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={getChartData()} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                  <XAxis dataKey="name" stroke="#a1a1aa" />
                  <YAxis stroke="#a1a1aa" />
                  <Tooltip
                    contentStyle={{
                      background: "#181821",
                      border: "1px solid rgba(255,255,255,0.08)",
                      color: "#fff",
                    }}
                  />
                  <Bar dataKey="count" fill="#C48A52" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default PlatformAnalytics;
