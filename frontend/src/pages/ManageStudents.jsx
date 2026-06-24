import { useState, useEffect } from "react";
import "../styles/ManageStudents.css";
import InstructorSidebar from "../components/InstructorSidebar";
import Topbar from "../components/Topbar";
import { authFetch } from "../utils/api";

function ManageStudents() {
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  // Load instructor's courses first
  useEffect(() => {
    authFetch("/instructor/courses")
      .then((res) => {
        if (!res.ok) throw new Error("Could not load courses");
        return res.json();
      })
      .then((data) => {
        setCourses(data);
        if (data.length > 0) {
          setSelectedCourseId(data[0].id.toString());
        }
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to load courses list.");
      })
      .finally(() => {
        setCoursesLoading(false);
      });
  }, []);

  // Fetch student roster when selected course changes
  useEffect(() => {
    if (!selectedCourseId) return;

    setLoading(true);
    authFetch(`/instructor/courses/${selectedCourseId}/students`)
      .then((res) => {
        if (!res.ok) throw new Error("Could not fetch student roster");
        return res.json();
      })
      .then((data) => {
        setStudents(data);
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to fetch student progress reports.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [selectedCourseId]);

  const activeCourse = courses.find((c) => c.id.toString() === selectedCourseId);
  const totalLessons = activeCourse ? activeCourse.totalLessons : 0;

  const filteredStudents = students.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="students-page">
      <InstructorSidebar />

      <div className="students-content">
        <Topbar />

        <div className="students-header">
          <div>
            <span>STUDENT MANAGEMENT</span>
            <h1>Manage Students</h1>
            <p>Monitor enrolled student rosters, progress completion rates, and learning states.</p>
          </div>
        </div>

        {coursesLoading ? (
          <div style={{ color: "var(--text-secondary)", padding: "20px" }}>Loading courses checklist...</div>
        ) : error ? (
          <div style={{ color: "#f87171", padding: "20px" }}>{error}</div>
        ) : courses.length === 0 ? (
          <div style={{ color: "var(--text-secondary)", padding: "20px" }}>
            No courses created yet. Please create a course under 'Manage Courses' first!
          </div>
        ) : (
          <>
            <div style={{ marginBottom: "25px", display: "flex", gap: "15px", alignItems: "center" }}>
              <label style={{ color: "var(--text-secondary)", fontWeight: "600" }}>Select Course:</label>
              <select
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                style={{
                  padding: "10px 20px",
                  background: "#12121a",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  borderRadius: "10px",
                  color: "#fff",
                  outline: "none",
                  cursor: "pointer",
                }}
              >
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.title}
                  </option>
                ))}
              </select>
            </div>

            <input
              type="text"
              placeholder="Search student by name or email..."
              className="student-search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            {loading ? (
              <div style={{ color: "var(--text-secondary)", textAlign: "center", padding: "40px" }}>
                <h3>Loading student list...</h3>
              </div>
            ) : filteredStudents.length === 0 ? (
              <div className="empty-state" style={{ color: "var(--text-secondary)", padding: "40px", textAlign: "center" }}>
                No enrolled students found.
              </div>
            ) : (
              <div className="students-table">
                <div className="table-head">
                  <span>Name</span>
                  <span>Email</span>
                  <span>Progress ({totalLessons} Lessons)</span>
                  <span>Enrolled On</span>
                </div>

                {filteredStudents.map((student) => {
                  const compLessons = student.completedLessons;
                  const pct = totalLessons > 0 ? ((compLessons / totalLessons) * 100).toFixed(0) : "0";
                  const isCompleted = totalLessons > 0 && compLessons === totalLessons;

                  return (
                    <div className="table-row" key={student.id}>
                      <span>{student.name}</span>
                      <span>{student.email}</span>
                      <span>
                        {compLessons} / {totalLessons} ({pct}%)
                      </span>
                      <span className={isCompleted ? "completed" : "active"}>
                        {new Date(student.enrolledAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default ManageStudents;