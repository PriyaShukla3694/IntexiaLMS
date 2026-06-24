import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../styles/VideoLearning.css";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import Footer from "../components/Footer";
import { useCourse } from "../hooks/useCourses";
import { authFetch } from "../utils/api";

function VideoLearning() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { course, loading, error } = useCourse(id);

  const [completedModuleIds, setCompletedModuleIds] = useState([]);
  const [activeModuleIndex, setActiveModuleIndex] = useState(0);
  const [markingProgress, setMarkingProgress] = useState(false);

  const fetchProgress = () => {
    authFetch(`/courses/${id}/progress`)
      .then((res) => {
        if (!res.ok) throw new Error("Could not retrieve progress");
        return res.json();
      })
      .then((data) => {
        if (data && data.data) {
          setCompletedModuleIds(data.data);
        }
      })
      .catch((err) => console.error("Error loading progress:", err));
  };

  useEffect(() => {
    if (id) {
      fetchProgress();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="student-dashboard">
        <Sidebar />
        <div className="main-content">
          <Topbar />
          <div style={{ padding: "80px", textAlign: "center", color: "var(--text-primary)" }}>
            <h2>Loading video lectures...</h2>
          </div>
          <Footer />
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="student-dashboard">
        <Sidebar />
        <div className="main-content">
          <Topbar />
          <div style={{ padding: "80px", textAlign: "center", color: "var(--text-primary)" }}>
            <h2>Course Not Found</h2>
            <p>Could not load the requested workspace learning lectures.</p>
            <button onClick={() => navigate("/my-courses")} className="next-btn" style={{ marginTop: "20px" }}>
              Back to My Courses
            </button>
          </div>
          <Footer />
        </div>
      </div>
    );
  }

  const modules = course.modules || [];
  const currentModule = modules[activeModuleIndex];

  const handleToggleComplete = async () => {
    if (!currentModule || markingProgress) return;
    setMarkingProgress(true);

    const isCurrentlyCompleted = completedModuleIds.includes(currentModule.id);
    const nextStatus = !isCurrentlyCompleted;

    try {
      const res = await authFetch(`/courses/${id}/progress`, {
        method: "POST",
        body: JSON.stringify({
          moduleId: currentModule.id,
          completed: nextStatus,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setCompletedModuleIds(data.data);

        // If newly completed and there is a next lesson, automatically advance after a tiny delay
        if (nextStatus && activeModuleIndex < modules.length - 1) {
          setTimeout(() => {
            setActiveModuleIndex((prev) => prev + 1);
          }, 300);
        } else if (nextStatus && activeModuleIndex === modules.length - 1) {
          alert(
            "Incredible! You have finished all lessons in this course! A verified course certificate of completion has been auto-generated for you under the 'Certificates' tab."
          );
        }
      } else {
        alert("Failed to update progress on server.");
      }
    } catch (err) {
      console.error(err);
      alert("Network error updating progress.");
    } finally {
      setMarkingProgress(false);
    }
  };

  const completionPct =
    modules.length > 0 ? ((completedModuleIds.length / modules.length) * 100).toFixed(0) : "0";

  // Dynamic lesson youtube URLs for variety
  const getEmbedUrl = (courseId, idx) => {
    // Return standard, safe educational youtube videos based on index and course
    const courseNum = parseInt(courseId);
    if (courseNum === 1) {
      // Cyber Security Basics playlist
      const urls = [
        "https://www.youtube.com/embed/inWWhr5tnEA",
        "https://www.youtube.com/embed/3Kq1MIfTWCE",
        "https://www.youtube.com/embed/nzD9y0LaTFM",
        "https://www.youtube.com/embed/v7Y5342aX6Q",
        "https://www.youtube.com/embed/XqE6b3qgEgw",
        "https://www.youtube.com/embed/x1GqE7uG4H8",
      ];
      return urls[idx % urls.length];
    } else if (courseNum === 2) {
      // Ethical Hacking
      const urls = [
        "https://www.youtube.com/embed/3Kq1MIfTWCE",
        "https://www.youtube.com/embed/inWWhr5tnEA",
        "https://www.youtube.com/embed/v7Y5342aX6Q",
        "https://www.youtube.com/embed/nzD9y0LaTFM",
        "https://www.youtube.com/embed/XqE6b3qgEgw",
        "https://www.youtube.com/embed/x1GqE7uG4H8",
      ];
      return urls[idx % urls.length];
    } else {
      // Python for AI
      const urls = [
        "https://www.youtube.com/embed/_uQrJ0TkZlc",
        "https://www.youtube.com/embed/mkv5s5yS0S4",
        "https://www.youtube.com/embed/JMUxmLtx-JY",
        "https://www.youtube.com/embed/I5W594D0jFk",
        "https://www.youtube.com/embed/Bf1r1K9RlhY",
        "https://www.youtube.com/embed/7eh486yIQs0",
      ];
      return urls[idx % urls.length];
    }
  };

  return (
    <div className="student-dashboard">
      <Sidebar />

      <div className="main-content">
        <Topbar />

        <div className="video-layout">
          {/* VIDEO SECTION */}
          <div className="video-main">
            {currentModule ? (
              <>
                <div className="video-player">
                  <iframe
                    width="100%"
                    height="100%"
                    src={getEmbedUrl(course.id, activeModuleIndex)}
                    title={currentModule.title}
                    allowFullScreen
                  ></iframe>
                </div>

                <div className="video-info">
                  <span className="lesson-tag">
                    MODULE {(activeModuleIndex + 1).toString().padStart(2, "0")}
                  </span>

                  <h1>{currentModule.title}</h1>

                  <p>
                    Estimated Duration: {currentModule.duration || "1.5 Hours"}. Dive into structural
                    architectures, threat detection scenarios, and hands-on simulation tools built on top
                    of cybersecurity frameworks. Use this learning workspace to master the concepts in detail.
                  </p>

                  <div className="course-progress">
                    <div className="progress-top">
                      <span>Course Progress</span>
                      <span>{completionPct}%</span>
                    </div>

                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${completionPct}%` }}></div>
                    </div>
                  </div>

                  <div className="lesson-actions">
                    <button
                      className="prev-btn"
                      disabled={activeModuleIndex === 0}
                      onClick={() => setActiveModuleIndex((prev) => prev - 1)}
                      style={{ opacity: activeModuleIndex === 0 ? 0.5 : 1 }}
                    >
                      ← Previous Lesson
                    </button>

                    <button
                      className="next-btn"
                      onClick={handleToggleComplete}
                      disabled={markingProgress}
                      style={{
                        background: completedModuleIds.includes(currentModule.id) ? "#22c55e" : "#C48A52",
                      }}
                    >
                      {completedModuleIds.includes(currentModule.id)
                        ? "✓ Completed (Toggle Undo)"
                        : "✓ Complete Lesson"}
                    </button>

                    <button
                      className="prev-btn"
                      disabled={activeModuleIndex === modules.length - 1}
                      onClick={() => setActiveModuleIndex((prev) => prev + 1)}
                      style={{ opacity: activeModuleIndex === modules.length - 1 ? 0.5 : 1 }}
                    >
                      Next Lesson →
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div style={{ color: "var(--text-secondary)", textAlign: "center", padding: "40px" }}>
                <h3>No modules added to this course yet.</h3>
              </div>
            )}
          </div>

          {/* COURSE CONTENT */}
          <div className="playlist-panel">
            <h2>Course Content</h2>
            {modules.length === 0 ? (
              <div style={{ color: "var(--text-secondary)" }}>No lessons available.</div>
            ) : (
              modules.map((mod, index) => {
                const isCompleted = completedModuleIds.includes(mod.id);
                const isActive = index === activeModuleIndex;

                let classes = "lesson";
                if (isActive) classes += " active";
                if (isCompleted) classes += " completed";

                return (
                  <div key={mod.id} className={classes} onClick={() => setActiveModuleIndex(index)}>
                    {isCompleted ? "✅ " : isActive ? "▶ " : "🔒 "}
                    {mod.title} ({mod.duration})
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* RESOURCES */}
        <div className="resources-section">
          <h2>Resources</h2>
          <div className="resource-grid">
            <div className="resource-card">📄 Lecture Slides & Slides.pdf</div>
            <div className="resource-card">📄 Lab Simulation Guide.pdf</div>
            <div className="resource-card">📄 Cyber Security Cheat Sheet.pdf</div>
          </div>
        </div>

        {/* NOTES */}
        <div className="notes-section">
          <h2>Instructor Notes</h2>
          <div className="notes-card">
            <p>• Make sure you configure your local sandbox environments before running scripts.</p>
            <p>• Complete the final verification checklist at the end of each module block.</p>
            <p>• Download resources from the resources grid to read offline.</p>
          </div>
        </div>

        <Footer />
      </div>
    </div>
  );
}

export default VideoLearning;