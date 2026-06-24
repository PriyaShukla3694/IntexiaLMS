import { useState, useEffect } from "react";
import "../styles/AdminPages.css";
import AdminSidebar from "../components/AdminSidebar";
import Topbar from "../components/Topbar";
import { authFetch } from "../utils/api";

function CourseApproval() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchPendingCourses = () => {
    setLoading(true);
    authFetch("/admin/courses/pending")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load pending courses");
        return res.json();
      })
      .then((data) => {
        setCourses(data);
      })
      .catch((err) => {
        console.error(err);
        setError("Error fetching pending course applications.");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchPendingCourses();
  }, []);

  const handleApprove = async (id) => {
    try {
      const res = await authFetch(`/admin/courses/${id}/approve`, {
        method: "PATCH",
        body: JSON.stringify({ approved: true }),
      });

      if (res.ok) {
        alert("Course approved successfully!");
        fetchPendingCourses();
      } else {
        alert("Failed to approve course.");
      }
    } catch (err) {
      console.error(err);
      alert("Error approving course.");
    }
  };

  const handleReject = async (id) => {
    const confirmReject = window.confirm("Are you sure you want to reject and delete this course submission?");
    if (!confirmReject) return;

    try {
      // Rejection deletes the pending course for clean database records
      const res = await authFetch(`/instructor/courses/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        alert("Course proposal rejected and deleted.");
        fetchPendingCourses();
      } else {
        alert("Failed to reject course proposal.");
      }
    } catch (err) {
      console.error(err);
      alert("Error rejecting course proposal.");
    }
  };

  return (
    <div className="admin-page">
      <AdminSidebar />

      <div className="admin-main">
        <Topbar />

        <h1 className="page-title">Course Approval</h1>

        {loading ? (
          <div style={{ color: "var(--text-secondary)", textAlign: "center", padding: "40px" }}>
            <h3>Loading pending submissions...</h3>
          </div>
        ) : error ? (
          <div style={{ color: "#f87171", textAlign: "center", padding: "40px" }}>
            <h3>{error}</h3>
          </div>
        ) : (
          <div className="approval-grid">
            {courses.length === 0 ? (
              <div style={{ color: "var(--text-secondary)", gridColumn: "1/-1", textAlign: "center", padding: "40px" }}>
                <h3>No Pending Courses Awaiting Approval</h3>
              </div>
            ) : (
              courses.map((course) => (
                <div className="approval-card" key={course.id}>
                  <h3>{course.title}</h3>
                  <p style={{ color: "var(--text-secondary)", margin: "8px 0" }}>
                    {course.tag} • {course.difficulty} • {course.duration}
                  </p>
                  <p style={{ fontSize: "14px", lineHeight: "1.5", marginBottom: "12px" }}>
                    {course.description}
                  </p>
                  <p style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
                    <strong>Instructor:</strong> {course.instructor}
                  </p>
                  <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "16px" }}>
                    <strong>Modules:</strong> {course.modules ? course.modules.length : 0}
                  </p>

                  <div className="action-row">
                    <button className="approve" onClick={() => handleApprove(course.id)}>
                      Approve
                    </button>

                    <button className="reject" onClick={() => handleReject(course.id)}>
                      Reject
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default CourseApproval;