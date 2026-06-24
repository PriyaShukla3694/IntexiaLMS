import { useState, useEffect } from "react";
import "../styles/ManageCourses.css";
import InstructorSidebar from "../components/InstructorSidebar";
import Topbar from "../components/Topbar";
import { authFetch } from "../utils/api";
import { useAuth } from "../context/AuthContext";

function ManageCourses() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  // Create/Edit Course Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [newCourse, setNewCourse] = useState({
    title: "",
    description: "",
    tag: "",
    difficulty: "Beginner",
    duration: "",
    instructor: "",
  });

  // Add Module Modal State
  const [showModuleModal, setShowModuleModal] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [newModule, setNewModule] = useState({
    title: "",
    duration: "",
  });

  const fetchCourses = () => {
    setLoading(true);
    authFetch("/instructor/courses")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load courses");
        return res.json();
      })
      .then((data) => {
        setCourses(data);
      })
      .catch((err) => {
        console.error(err);
        setError("Error fetching courses from database.");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  // SAVE COURSE (Create or Edit)
  const handleSaveCourse = async () => {
    if (!newCourse.title) {
      alert("Course Title is required.");
      return;
    }

    const payload = {
      title: newCourse.title,
      description: newCourse.description || "No description provided.",
      tag: newCourse.tag || "CYBER SECURITY",
      difficulty: newCourse.difficulty || "Beginner",
      duration: newCourse.duration || "10 Hours",
      instructor: newCourse.instructor || user?.name || "Cyber Expert",
    };

    try {
      const url = editingId ? `/instructor/courses/${editingId}` : "/instructor/courses";
      const method = editingId ? "PUT" : "POST";

      const res = await authFetch(url, {
        method,
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setShowModal(false);
        setEditingId(null);
        setNewCourse({
          title: "",
          description: "",
          tag: "",
          difficulty: "Beginner",
          duration: "",
          instructor: "",
        });
        fetchCourses();
      } else {
        const errData = await res.json();
        alert(errData.error || "Failed to save course.");
      }
    } catch (err) {
      console.error(err);
      alert("Error saving course details.");
    }
  };

  // DELETE COURSE
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this course and all associated lessons, student enrollments, and completion progress?"
    );

    if (confirmDelete) {
      try {
        const res = await authFetch(`/instructor/courses/${id}`, {
          method: "DELETE",
        });

        if (res.ok) {
          fetchCourses();
        } else {
          alert("Failed to delete course.");
        }
      } catch (err) {
        console.error(err);
        alert("Error sending delete request.");
      }
    }
  };

  // EDIT COURSE
  const handleEdit = (course) => {
    setEditingId(course.id);
    setNewCourse({
      title: course.title,
      description: course.description || "",
      tag: course.tag || "",
      difficulty: course.difficulty || "Beginner",
      duration: course.duration || "",
      instructor: course.instructor || "",
    });
    setShowModal(true);
  };

  // ADD MODULE
  const handleSaveModule = async () => {
    if (!newModule.title) {
      alert("Lesson Title is required.");
      return;
    }

    try {
      const res = await authFetch(`/instructor/courses/${selectedCourseId}/modules`, {
        method: "POST",
        body: JSON.stringify({
          title: newModule.title,
          duration: newModule.duration || "1.5 Hours",
        }),
      });

      if (res.ok) {
        setShowModuleModal(false);
        setSelectedCourseId(null);
        setNewModule({ title: "", duration: "" });
        fetchCourses();
      } else {
        alert("Failed to add module.");
      }
    } catch (err) {
      console.error(err);
      alert("Error adding module lesson.");
    }
  };

  const filteredCourses = courses.filter((course) =>
    course.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="manage-page">
      <InstructorSidebar />

      <div className="manage-content">
        <Topbar />

        <div className="manage-header">
          <div>
            <span>COURSE MANAGEMENT</span>
            <h1>Manage Courses</h1>
            <p>Create, edit, organize courses and add lecture modules.</p>
          </div>

          <button
            className="add-course-btn"
            onClick={() => {
              setEditingId(null);
              setNewCourse({
                title: "",
                description: "",
                tag: "",
                difficulty: "Beginner",
                duration: "",
                instructor: user?.name || "",
              });
              setShowModal(true);
            }}
          >
            + Add Course
          </button>
        </div>

        <input
          className="course-search"
          type="text"
          placeholder="Search course..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {loading ? (
          <div style={{ color: "var(--text-secondary)", textAlign: "center", padding: "40px" }}>
            <h3>Loading instructor workspace courses...</h3>
          </div>
        ) : error ? (
          <div style={{ color: "#f87171", textAlign: "center", padding: "40px" }}>
            <h3>{error}</h3>
          </div>
        ) : (
          <div className="course-list">
            {filteredCourses.length === 0 ? (
              <div className="empty-state">No Courses Found</div>
            ) : (
              filteredCourses.map((course) => (
                <div key={course.id} className="course-row">
                  <div>
                    <h3>{course.title}</h3>
                    <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
                      {course.tag} • {course.difficulty} • {course.duration}
                    </p>
                    <p style={{ marginTop: "6px" }}>
                      {course.students} Students • {course.modules} Modules
                      {!course.approved && (
                        <span
                          style={{
                            marginLeft: "12px",
                            background: "rgba(239, 68, 68, 0.15)",
                            color: "#ef4444",
                            padding: "2px 8px",
                            borderRadius: "12px",
                            fontSize: "12px",
                          }}
                        >
                          Awaiting Admin Approval
                        </span>
                      )}
                      {course.approved && (
                        <span
                          style={{
                            marginLeft: "12px",
                            background: "rgba(34, 197, 94, 0.15)",
                            color: "#22c55e",
                            padding: "2px 8px",
                            borderRadius: "12px",
                            fontSize: "12px",
                          }}
                        >
                          Approved & Active
                        </span>
                      )}
                    </p>
                  </div>

                  <div className="course-actions">
                    <button
                      onClick={() => {
                        setSelectedCourseId(course.id);
                        setShowModuleModal(true);
                      }}
                      style={{ background: "#2563eb", color: "#fff" }}
                    >
                      + Lesson
                    </button>

                    <button onClick={() => handleEdit(course)}>Edit</button>

                    <button onClick={() => handleDelete(course.id)}>Delete</button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* CREATE/EDIT MODAL */}
        {showModal && (
          <div className="modal-overlay">
            <div className="course-modal">
              <h2>{editingId ? "Edit Course" : "Add Course"}</h2>

              <label style={{ color: "var(--text-secondary)", fontSize: "13px", display: "block", marginBottom: "4px" }}>
                Course Title *
              </label>
              <input
                type="text"
                placeholder="Cyber Security Basics"
                value={newCourse.title}
                onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
              />

              <label style={{ color: "var(--text-secondary)", fontSize: "13px", display: "block", marginBottom: "4px" }}>
                Description
              </label>
              <input
                type="text"
                placeholder="Learn cyber defense fundamentals..."
                value={newCourse.description}
                onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
              />

              <label style={{ color: "var(--text-secondary)", fontSize: "13px", display: "block", marginBottom: "4px" }}>
                Category Tag
              </label>
              <input
                type="text"
                placeholder="CYBER SECURITY TRACK"
                value={newCourse.tag}
                onChange={(e) => setNewCourse({ ...newCourse, tag: e.target.value })}
              />

              <label style={{ color: "var(--text-secondary)", fontSize: "13px", display: "block", marginBottom: "4px" }}>
                Difficulty
              </label>
              <select
                value={newCourse.difficulty}
                onChange={(e) => setNewCourse({ ...newCourse, difficulty: e.target.value })}
                style={{
                  width: "100%",
                  padding: "12px",
                  background: "#181821",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "10px",
                  color: "#fff",
                  marginBottom: "15px",
                }}
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>

              <label style={{ color: "var(--text-secondary)", fontSize: "13px", display: "block", marginBottom: "4px" }}>
                Estimated Duration
              </label>
              <input
                type="text"
                placeholder="12 Hours"
                value={newCourse.duration}
                onChange={(e) => setNewCourse({ ...newCourse, duration: e.target.value })}
              />

              <label style={{ color: "var(--text-secondary)", fontSize: "13px", display: "block", marginBottom: "4px" }}>
                Lead Instructor
              </label>
              <input
                type="text"
                placeholder="Shourya Cyber Academy"
                value={newCourse.instructor}
                onChange={(e) => setNewCourse({ ...newCourse, instructor: e.target.value })}
              />

              <div className="modal-actions">
                <button onClick={handleSaveCourse}>Save</button>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setEditingId(null);
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ADD LESSON MODULE MODAL */}
        {showModuleModal && (
          <div className="modal-overlay">
            <div className="course-modal">
              <h2>Add Lesson Module</h2>

              <label style={{ color: "var(--text-secondary)", fontSize: "13px", display: "block", marginBottom: "4px" }}>
                Lesson Module Title *
              </label>
              <input
                type="text"
                placeholder="e.g. Introduction to Firewalls"
                value={newModule.title}
                onChange={(e) => setNewModule({ ...newModule, title: e.target.value })}
              />

              <label style={{ color: "var(--text-secondary)", fontSize: "13px", display: "block", marginBottom: "4px" }}>
                Lesson Duration
              </label>
              <input
                type="text"
                placeholder="e.g. 2 Hours"
                value={newModule.duration}
                onChange={(e) => setNewModule({ ...newModule, duration: e.target.value })}
              />

              <div className="modal-actions">
                <button onClick={handleSaveModule} style={{ background: "#2563eb" }}>
                  Add Lesson
                </button>
                <button
                  onClick={() => {
                    setShowModuleModal(false);
                    setSelectedCourseId(null);
                    setNewModule({ title: "", duration: "" });
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ManageCourses;