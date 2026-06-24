import "../styles/CourseDetails.css";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import Footer from "../components/Footer";
import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { useCourse } from "../hooks/useCourses";
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

function CourseDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { course, loading, error } = useCourse(id);

  const [enrolled, setEnrolled] = useState(false);
  const [progress, setProgress] = useState(null);
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    if (!id) return;

    authFetch(`/courses/${id}/progress`)
      .then((res) => {
        if (res.status === 401) return null;
        return res.json();
      })
      .then((data) => {
        if (data) {
          setEnrolled(true);
          setProgress(data);
        } else {
          setEnrolled(false);
        }
      })
      .catch((err) => console.error("Error fetching progress:", err));
  }, [id]);

  const handleEnroll = async () => {
    setEnrolling(true);
    try {
      const res = await authFetch(`/courses/${id}/enroll`, {
        method: "POST",
      });

      if (res.ok) {
        setEnrolled(true);
        const progRes = await authFetch(`/courses/${id}/progress`);
        if (progRes.ok) {
          const progData = await progRes.json();
          setProgress(progData);
        }
      } else {
        alert("Failed to enroll in course.");
      }
    } catch (err) {
      console.error(err);
      alert("Error enrolling in course.");
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return (
      <div className="course-details-page">
        <Sidebar />
        <div className="course-details-content">
          <Topbar />
          <div style={{ padding: "40px", textAlign: "center", color: "var(--text-primary)" }}>
            <h2>Loading course details...</h2>
          </div>
          <Footer />
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="course-details-page">
        <Sidebar />
        <div className="course-details-content">
          <Topbar />
          <div style={{ padding: "40px", textAlign: "center", color: "var(--text-primary)" }}>
            <h2>Course Not Found</h2>
            <p>{error || "The requested course could not be found."}</p>
            <button
              onClick={() => navigate("/my-courses")}
              style={{
                marginTop: "20px",
                padding: "10px 20px",
                background: "var(--accent-glow)",
                border: "none",
                color: "#fff",
                borderRadius: "5px",
                cursor: "pointer",
              }}
            >
              Back to My Courses
            </button>
          </div>
          <Footer />
        </div>
      </div>
    );
  }

  const completionPct = course.totalLessons > 0 && progress
    ? ((progress.completedLessons / course.totalLessons) * 100).toFixed(0)
    : "0";

  return (
    <div className="course-details-page">
      <Sidebar />

      <div className="course-details-content">
        <Topbar />

        {/* HERO */}
        <div className="course-hero">
          <div className="course-left">
            <span className="course-tag">
              {course.tag}
            </span>

            <h1>
              {course.title}
            </h1>

            <p>
              {course.description}
            </p>

            <div className="course-stats">
              <div>
                <h3>{course.totalLessons}</h3>
                <span>Lessons</span>
              </div>

              <div>
                <h3>{course.duration}</h3>
                <span>Duration</span>
              </div>

              <div>
                <h3>{enrolled ? `${completionPct}%` : "—"}</h3>
                <span>Completed</span>
              </div>

            </div>

            {enrolled ? (
              <button
                className="start-learning-btn"
                onClick={() => navigate(`/course/${course.id}/learning`)}
              >
                {progress?.completedLessons > 0 ? "Continue Learning →" : "Start Learning →"}
              </button>
            ) : (
              <button
                className="start-learning-btn"
                onClick={handleEnroll}
                disabled={enrolling}
              >
                {enrolling ? "Enrolling..." : "Enroll in Course →"}
              </button>
            )}

          </div>

          <div className="course-right">
            <img src={getCourseImage(course.id)} alt={course.title} />
          </div>

        </div>

        {/* COURSE PROGRESS */}
        <div className="progress-section">
          <div className="progress-card">
            <h2>Your Progress</h2>

            {enrolled ? (
              <>
                <div className="progress-top">
                  <span>Completed</span>
                  <span>{completionPct}%</span>
                </div>

                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${completionPct}%` }}
                  ></div>
                </div>
              </>
            ) : (
              <p style={{ color: "var(--text-secondary)", marginTop: "10px" }}>
                Enroll in this course to track your learning progress.
              </p>
            )}

          </div>

        </div>

        {/* SKILLS */}
        <div className="skills-section">
          <h2>Skills You'll Learn</h2>

          <div className="skills-grid">
            {course.difficulty && (
              <div className="skill-card" style={{ border: "1px solid var(--accent-glow)" }}>
                Difficulty: {course.difficulty}
              </div>
            )}
            {/* Split comma list or standard array */}
            {Array.isArray(course.skills) ? (
              course.skills.map((skill, index) => (
                <div key={index} className="skill-card">
                  {skill}
                </div>
              ))
            ) : (
              // Fallback default skills list based on course type
              (course.title.includes("Security")
                ? ["Network Security", "Threat Analysis", "Ethical Hacking", "Penetration Testing", "Malware Detection", "Cyber Defense"]
                : course.title.includes("Hacking")
                ? ["Penetration Testing", "Vulnerability Assessment", "Footprinting", "Social Engineering", "Wireless Security", "Web App Hacking"]
                : ["Python Basics", "Numpy & Pandas", "Machine Learning", "Neural Networks", "TensorFlow / PyTorch", "AI Deployment"]
              ).map((skill, index) => (
                <div key={index} className="skill-card">
                  {skill}
                </div>
              ))
            )}
          </div>

        </div>

        {/* MODULES */}
        <div className="module-section">
          <h2>Course Modules</h2>

          <div className="module-grid">
            {course.modules && course.modules.map((mod, index) => (
              <div key={mod.id || index} className="module-card">
                <span>{(index + 1).toString().padStart(2, "0")}</span>
                {mod.title} ({mod.duration})
              </div>
            ))}
          </div>

        </div>

        {/* INSTRUCTOR */}
        <div className="instructor-card">
          <h2>Instructor</h2>

          <h3>{course.instructor}</h3>

          <p>
            Certified Cyber Security Experts with industry experience in Ethical Hacking, Digital Forensics and Security Operations.
          </p>

        </div>

        <Footer />

      </div>

    </div>
  );
}

export default CourseDetails;